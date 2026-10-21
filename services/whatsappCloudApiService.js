const axios = require('axios');
const GlobalSetting = require('../models/GlobalSetting');
const WhatsAppMessageLog = require('../models/WhatsAppMessageLog');

class WhatsAppCloudApiService {
  constructor() {
    this.defaultApiVersion = 'v20.0';
    this.defaultVerifyToken = 'school_erp_meta_webhook_secret';
    this.requestTimeout = 15000; // 15 seconds
  }

  /**
   * Helper: Normalize phone numbers to valid E.164 digits without '+'
   */
  normalizePhoneNumber(rawPhone) {
    if (!rawPhone) {
      throw new Error('Phone number is required');
    }
    let cleaned = String(rawPhone).replace(/[^0-9]/g, '');

    // Common standard Indian mobile: 10 digits -> prepend 91
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      cleaned = '91' + cleaned.slice(1);
    }

    if (cleaned.length < 8 || cleaned.length > 15) {
      throw new Error(`Invalid phone number length (${cleaned.length} digits). E.164 numbers must be between 8 and 15 digits.`);
    }

    return cleaned;
  }

  /**
   * Helper: Mask access token for safe frontend exposure
   */
  maskToken(token) {
    if (!token || typeof token !== 'string') return '';
    if (token.length <= 12) return '••••••••••••';
    return `${token.substring(0, 6)}••••••••${token.substring(token.length - 4)}`;
  }

  /**
   * Get merged configuration from GlobalSetting DB and process.env
   */
  async getConfig() {
    let dbSetting = null;
    try {
      dbSetting = await GlobalSetting.findOne({ key: 'whatsapp_cloud_api' });
    } catch (err) {
      console.warn('Could not read whatsapp_cloud_api from DB:', err.message);
    }

    const val = dbSetting?.value || {};

    const accessToken = val.accessToken || process.env.META_WHATSAPP_TOKEN || process.env.WHATSAPP_CLOUD_ACCESS_TOKEN || '';
    const phoneNumberId = val.phoneNumberId || process.env.META_PHONE_NUMBER_ID || process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID || '';
    const wabaId = val.wabaId || process.env.META_WABA_ID || process.env.WHATSAPP_CLOUD_WABA_ID || '';
    const apiVersion = val.apiVersion || process.env.META_API_VERSION || this.defaultApiVersion;
    const webhookVerifyToken = val.webhookVerifyToken || process.env.META_WEBHOOK_VERIFY_TOKEN || this.defaultVerifyToken;

    const isConfigured = Boolean(accessToken && phoneNumberId);

    return {
      accessToken,
      phoneNumberId,
      wabaId,
      apiVersion,
      webhookVerifyToken,
      isConfigured,
      verifiedName: val.verifiedName || null,
      displayPhoneNumber: val.displayPhoneNumber || null,
      qualityRating: val.qualityRating || null,
      codeVerificationStatus: val.codeVerificationStatus || null,
      accountMode: val.accountMode || null,
      lastVerifiedAt: val.lastVerifiedAt || null,
      maskedToken: this.maskToken(accessToken)
    };
  }

  /**
   * Live verification of credentials against Meta Graph API
   */
  async verifyCredentials(phoneNumberId, accessToken, apiVersion = this.defaultApiVersion) {
    if (!phoneNumberId || !accessToken) {
      return {
        isValid: false,
        error: 'Phone Number ID and Access Token are required for verification.'
      };
    }

    const cleanVersion = apiVersion.startsWith('v') ? apiVersion : `v${apiVersion}`;
    const url = `https://graph.facebook.com/${cleanVersion}/${phoneNumberId}?fields=verified_name,display_phone_number,quality_rating,code_verification_status,account_mode`;

    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: this.requestTimeout
      });

      const data = response.data;
      return {
        isValid: true,
        phoneNumberId,
        displayPhoneNumber: data.display_phone_number || '',
        verifiedName: data.verified_name || '',
        qualityRating: data.quality_rating || 'UNKNOWN',
        codeVerificationStatus: data.code_verification_status || 'UNKNOWN',
        accountMode: data.account_mode || 'LIVE',
        raw: data
      };
    } catch (err) {
      const metaError = err.response?.data?.error;
      const errorMessage = metaError?.message || err.message || 'Meta API verification failed';
      const errorCode = metaError?.code || err.response?.status || 500;
      const errorDetails = metaError?.error_data?.details || metaError?.error_user_msg || metaError?.type || '';

      return {
        isValid: false,
        status: err.response?.status || 500,
        code: errorCode,
        error: errorMessage,
        details: errorDetails
      };
    }
  }

  /**
   * Save and verify Cloud API settings
   */
  async saveConfig({ accessToken, phoneNumberId, wabaId, apiVersion, webhookVerifyToken }) {
    const config = await this.getConfig();

    const finalAccessToken = accessToken && !accessToken.includes('••••') 
      ? accessToken.trim() 
      : config.accessToken;
    const finalPhoneNumberId = phoneNumberId ? phoneNumberId.trim() : config.phoneNumberId;
    const finalWabaId = wabaId ? wabaId.trim() : config.wabaId;
    const finalApiVersion = apiVersion ? apiVersion.trim() : config.apiVersion;
    const finalVerifyToken = webhookVerifyToken ? webhookVerifyToken.trim() : config.webhookVerifyToken;

    // Verify against Meta Graph API
    const verification = await this.verifyCredentials(finalPhoneNumberId, finalAccessToken, finalApiVersion);

    const settingValue = {
      accessToken: finalAccessToken,
      phoneNumberId: finalPhoneNumberId,
      wabaId: finalWabaId,
      apiVersion: finalApiVersion,
      webhookVerifyToken: finalVerifyToken,
      isConfigured: verification.isValid,
      verifiedName: verification.verifiedName || '',
      displayPhoneNumber: verification.displayPhoneNumber || '',
      qualityRating: verification.qualityRating || '',
      codeVerificationStatus: verification.codeVerificationStatus || '',
      accountMode: verification.accountMode || '',
      lastVerifiedAt: new Date(),
      lastError: verification.isValid ? null : { message: verification.error, code: verification.code }
    };

    await GlobalSetting.findOneAndUpdate(
      { key: 'whatsapp_cloud_api' },
      { key: 'whatsapp_cloud_api', value: settingValue },
      { upsert: true, new: true }
    );

    return {
      ...verification,
      maskedToken: this.maskToken(finalAccessToken),
      webhookVerifyToken: finalVerifyToken,
      apiVersion: finalApiVersion
    };
  }

  /**
   * Clear Cloud API configuration
   */
  async clearConfig() {
    await GlobalSetting.findOneAndDelete({ key: 'whatsapp_cloud_api' });
    return { success: true, message: 'Meta WhatsApp Cloud API configuration cleared.' };
  }

  /**
   * Send text message via Meta WhatsApp Cloud API
   */
  async sendTextMessage(toPhone, bodyText, metadata = {}) {
    if (!bodyText || typeof bodyText !== 'string' || !bodyText.trim()) {
      throw new Error('Message content is required');
    }

    const cleanPhone = this.normalizePhoneNumber(toPhone);
    const config = await this.getConfig();

    if (!config.isConfigured || !config.accessToken || !config.phoneNumberId) {
      throw new Error('Meta WhatsApp Cloud API is not configured. Please provide a valid Phone Number ID and Access Token in SuperAdmin WhatsApp Gateway Settings.');
    }

    const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: bodyText.trim()
      }
    };

    let log = null;
    try {
      log = await WhatsAppMessageLog.create({
        phone: cleanPhone,
        recipientName: metadata.recipientName || 'Recipient',
        senderName: metadata.senderName || 'School Admin',
        threadId: metadata.threadId || '',
        messageType: 'text',
        content: bodyText.trim(),
        status: 'pending',
        statusHistory: [{ status: 'pending', timestamp: new Date(), details: { payload } }]
      });
    } catch (logErr) {
      console.warn('WhatsApp log creation warning:', logErr.message);
    }

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: this.requestTimeout
      });

      const data = response.data;
      const wamid = data?.messages?.[0]?.id;

      if (!wamid) {
        throw new Error('Meta API responded with 200 but returned no message ID.');
      }

      if (log) {
        log.wamid = wamid;
        log.status = 'accepted';
        log.statusHistory.push({
          status: 'accepted',
          timestamp: new Date(),
          details: { providerResponse: data }
        });
        log.rawProviderResponse = data;
        await log.save();
      }

      return {
        success: true,
        messageId: wamid,
        status: 'accepted',
        recipient: cleanPhone,
        logId: log?._id
      };
    } catch (err) {
      const metaError = err.response?.data?.error;
      const errorMessage = metaError?.message || err.message || 'Meta Cloud API rejected the message request.';
      const errorCode = metaError?.code || err.response?.status || 500;
      const errorDetails = metaError?.error_data?.details || metaError?.error_user_msg || '';

      if (log) {
        log.status = 'failed';
        log.errorCode = errorCode;
        log.errorMessage = errorMessage;
        log.errorDetails = { metaError, errorDetails };
        log.statusHistory.push({
          status: 'failed',
          timestamp: new Date(),
          details: { error: errorMessage, code: errorCode, details: errorDetails }
        });
        await log.save();
      }

      const error = new Error(`Meta WhatsApp Cloud API Error: ${errorMessage}`);
      error.status = err.response?.status || 500;
      error.code = errorCode;
      error.details = errorDetails;
      error.metaError = metaError;
      throw error;
    }
  }

  /**
   * Send approved template message via Meta WhatsApp Cloud API
   */
  async sendTemplateMessage(toPhone, templateName, languageCode = 'en_US', components = [], metadata = {}) {
    if (!templateName || typeof templateName !== 'string') {
      throw new Error('Template name is required for template messaging.');
    }

    const cleanPhone = this.normalizePhoneNumber(toPhone);
    const config = await this.getConfig();

    if (!config.isConfigured || !config.accessToken || !config.phoneNumberId) {
      throw new Error('Meta WhatsApp Cloud API is not configured. Please set Phone Number ID and Access Token in settings.');
    }

    const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'template',
      template: {
        name: templateName.trim(),
        language: {
          code: languageCode || 'en_US'
        },
        components: Array.isArray(components) ? components : []
      }
    };

    let log = null;
    try {
      log = await WhatsAppMessageLog.create({
        phone: cleanPhone,
        recipientName: metadata.recipientName || 'Recipient',
        senderName: metadata.senderName || 'School Admin',
        threadId: metadata.threadId || '',
        messageType: 'template',
        templateName: templateName.trim(),
        languageCode: languageCode || 'en_US',
        content: `[Template: ${templateName}]`,
        status: 'pending',
        statusHistory: [{ status: 'pending', timestamp: new Date(), details: { payload } }]
      });
    } catch (logErr) {
      console.warn('WhatsApp template log creation warning:', logErr.message);
    }

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: this.requestTimeout
      });

      const data = response.data;
      const wamid = data?.messages?.[0]?.id;

      if (!wamid) {
        throw new Error('Meta API responded with 200 but returned no message ID.');
      }

      if (log) {
        log.wamid = wamid;
        log.status = 'accepted';
        log.statusHistory.push({
          status: 'accepted',
          timestamp: new Date(),
          details: { providerResponse: data }
        });
        log.rawProviderResponse = data;
        await log.save();
      }

      return {
        success: true,
        messageId: wamid,
        status: 'accepted',
        recipient: cleanPhone,
        templateName,
        logId: log?._id
      };
    } catch (err) {
      const metaError = err.response?.data?.error;
      const errorMessage = metaError?.message || err.message || 'Meta Cloud API rejected template message request.';
      const errorCode = metaError?.code || err.response?.status || 500;
      const errorDetails = metaError?.error_data?.details || metaError?.error_user_msg || '';

      if (log) {
        log.status = 'failed';
        log.errorCode = errorCode;
        log.errorMessage = errorMessage;
        log.errorDetails = { metaError, errorDetails };
        log.statusHistory.push({
          status: 'failed',
          timestamp: new Date(),
          details: { error: errorMessage, code: errorCode, details: errorDetails }
        });
        await log.save();
      }

      const error = new Error(`Meta WhatsApp Cloud API Error: ${errorMessage}`);
      error.status = err.response?.status || 500;
      error.code = errorCode;
      error.details = errorDetails;
      error.metaError = metaError;
      throw error;
    }
  }

  /**
   * Handle incoming Meta Webhook delivery status events
   */
  async handleWebhookEvent(body) {
    if (!body || body.object !== 'whatsapp_business_account') {
      return { processed: false, reason: 'Not a whatsapp_business_account object' };
    }

    const entries = body.entry || [];
    let processedStatuses = 0;

    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field === 'messages') {
          const value = change.value || {};
          const statuses = value.statuses || [];

          for (const st of statuses) {
            const wamid = st.id;
            const status = st.status; // 'sent' | 'delivered' | 'read' | 'failed'
            const timestamp = st.timestamp ? new Date(Number(st.timestamp) * 1000) : new Date();
            const errors = st.errors || [];

            if (!wamid) continue;

            try {
              const log = await WhatsAppMessageLog.findOne({ wamid });
              if (log) {
                // Deduplication check: ignore if status already matches current state
                if (log.status !== status) {
                  log.status = status;
                  if (errors.length > 0) {
                    log.errorCode = errors[0].code;
                    log.errorMessage = errors[0].message || errors[0].title;
                    log.errorDetails = errors;
                  }
                  log.statusHistory.push({
                    status,
                    timestamp,
                    details: { errors, raw: st }
                  });
                  await log.save();
                  processedStatuses++;
                }
              }
            } catch (err) {
              console.warn(`Error updating delivery status for ${wamid}:`, err.message);
            }
          }
        }
      }
    }

    return { processed: true, count: processedStatuses };
  }

  /**
   * Query delivery logs
   */
  async getDeliveryLogs(filter = {}, limit = 50, skip = 0) {
    const logs = await WhatsAppMessageLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(skip) || 0)
      .limit(Math.min(Number(limit) || 50, 100));

    const total = await WhatsAppMessageLog.countDocuments(filter);

    return {
      total,
      count: logs.length,
      logs
    };
  }
}

module.exports = new WhatsAppCloudApiService();
