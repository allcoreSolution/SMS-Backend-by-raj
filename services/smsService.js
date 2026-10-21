const twilio = require('twilio');
const GlobalSetting = require('../models/GlobalSetting');

class SmsService {
  constructor() {
    this.client = null;
  }

  /**
   * Helper: Normalize phone numbers to standard E.164 format with country code
   */
  normalizePhoneNumber(rawPhone) {
    if (!rawPhone) {
      throw new Error('Phone number is required');
    }
    let cleaned = String(rawPhone).trim().replace(/[^0-9+]/g, '');

    // If starts with 0 and 11 digits, replace 0 with +91
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      cleaned = '+91' + cleaned.slice(1);
    }
    // If standard 10 digit Indian number without country code
    else if (!cleaned.startsWith('+') && cleaned.length === 10) {
      cleaned = '+91' + cleaned;
    }
    // If 12 digits starting with 91 but no +
    else if (!cleaned.startsWith('+') && cleaned.startsWith('91') && cleaned.length === 12) {
      cleaned = '+' + cleaned;
    }
    // If no leading +
    else if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Get Twilio Credentials from Environment Variables or GlobalSettings MongoDB
   */
  async getConfig() {
    let dbSetting = null;
    try {
      dbSetting = await GlobalSetting.findOne({ key: 'twilio_sms_config' });
    } catch (e) {
      // Quiet DB error fallback
    }

    const val = dbSetting?.value || {};

    const accountSid = (process.env.TWILIO_ACCOUNT_SID || val.accountSid || '').trim();
    const authToken = (process.env.TWILIO_AUTH_TOKEN || val.authToken || '').trim();
    const phoneNumber = (process.env.TWILIO_PHONE_NUMBER || val.phoneNumber || val.from || '').trim();

    const isConfigured = Boolean(
      accountSid && 
      authToken && 
      phoneNumber && 
      !accountSid.includes('your_') && 
      !authToken.includes('your_')
    );

    return {
      isConfigured,
      accountSid,
      authToken,
      phoneNumber,
      maskedToken: authToken ? `${authToken.substring(0, 4)}••••••••${authToken.substring(authToken.length - 4)}` : ''
    };
  }

  /**
   * Send a single SMS via Twilio
   */
  async sendSMS(toPhone, messageText) {
    if (!toPhone || !messageText) {
      throw new Error('Recipient phone number and message text are required');
    }

    const config = await this.getConfig();
    const normalizedTo = this.normalizePhoneNumber(toPhone);

    if (!config.isConfigured) {
      console.warn('⚠️ Twilio SMS is not configured in .env or database. SMS logged in simulation mode.');
      return {
        success: false,
        simulated: true,
        message: 'Twilio credentials not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER to .env',
        to: normalizedTo,
        body: messageText
      };
    }

    try {
      const client = twilio(config.accountSid, config.authToken);
      const result = await client.messages.create({
        body: messageText,
        from: config.phoneNumber,
        to: normalizedTo
      });

      console.log(`✅ Twilio SMS dispatched successfully! SID: ${result.sid} to ${normalizedTo}`);
      return {
        success: true,
        sid: result.sid,
        status: result.status,
        to: result.to,
        from: result.from,
        dateCreated: result.dateCreated
      };
    } catch (error) {
      console.error('❌ Twilio SMS delivery failed:', error.message);
      return {
        success: false,
        error: error.message,
        code: error.code || null,
        to: normalizedTo
      };
    }
  }

  /**
   * Send bulk SMS to multiple recipients
   */
  async sendBulkSMS(phoneNumbers = [], messageText) {
    if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return { success: true, count: 0, results: [] };
    }

    const results = [];
    let sentCount = 0;
    let failedCount = 0;

    for (const phone of phoneNumbers) {
      try {
        const res = await this.sendSMS(phone, messageText);
        if (res.success) {
          sentCount++;
        } else {
          failedCount++;
        }
        results.push(res);
      } catch (err) {
        failedCount++;
        results.push({ success: false, error: err.message, phone });
      }
    }

    return {
      success: true,
      total: phoneNumbers.length,
      sentCount,
      failedCount,
      results
    };
  }
}

module.exports = new SmsService();
