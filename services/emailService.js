const nodemailer = require('nodemailer');
const GlobalSetting = require('../models/GlobalSetting');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  /**
   * Get or initialize nodemailer transporter using .env or GlobalSetting
   */
  async getTransporter() {
    let host = process.env.SMTP_HOST || 'smtp.gmail.com';
    let port = parseInt(process.env.SMTP_PORT || '587', 10);
    let secure = process.env.SMTP_SECURE === 'true' || port === 465;
    let user = process.env.SMTP_USER || '';
    let pass = process.env.SMTP_PASS || '';

    // Check if SMTP settings exist in GlobalSetting DB
    try {
      const dbSetting = await GlobalSetting.findOne({ key: 'smtp_settings' });
      if (dbSetting && dbSetting.value) {
        if (dbSetting.value.host) host = dbSetting.value.host;
        if (dbSetting.value.port) port = parseInt(dbSetting.value.port, 10);
        if (dbSetting.value.secure !== undefined) secure = dbSetting.value.secure;
        if (dbSetting.value.user || dbSetting.value.username) user = dbSetting.value.user || dbSetting.value.username;
        if (dbSetting.value.pass || dbSetting.value.password) pass = dbSetting.value.pass || dbSetting.value.password;
      }
    } catch (err) {
      console.warn('Could not read smtp_settings from DB:', err.message);
    }

    if (!user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  /**
   * Send real email over SMTP
   * @param {Object} options { to, subject, text, html, from, replyTo }
   */
  async sendMail({ to, subject, text, html, from, replyTo }) {
    try {
      const transporter = await this.getTransporter();
      const senderFrom = from || process.env.EMAIL_FROM || (process.env.SMTP_USER ? `All Core Solutions <${process.env.SMTP_USER}>` : '"All Core Solutions" <helpdesk@allcoresolution.com>');

      if (!transporter) {
        console.warn(`[EmailService] ⚠️ SMTP credentials (SMTP_USER & SMTP_PASS) not configured in .env. Live email to <${to}> logged in DB only.`);
        return {
          delivered: false,
          reason: 'SMTP_CREDENTIALS_MISSING',
          message: 'SMTP credentials not configured in server environment. Please set SMTP_USER and SMTP_PASS (Gmail App Password).'
        };
      }

      console.log(`[EmailService] 🚀 Attempting real SMTP email delivery to: ${to}...`);

      const mailOptions = {
        from: senderFrom,
        to,
        replyTo: replyTo || from,
        subject,
        text,
        html: html || `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">All Core Solutions - Official Mail Desk</h2>
          <p style="white-space: pre-wrap;">${text}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #64748b;">This email was sent from the All Core Solutions School ERP Communications Desk.</p>
        </div>`
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] ✅ Email successfully delivered to ${to}! Message ID: ${info.messageId}`);
      return {
        delivered: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (err) {
      console.error(`[EmailService] ❌ Failed to send SMTP email to ${to}:`, err.message);
      return {
        delivered: false,
        reason: 'SMTP_SEND_FAILED',
        error: err.message
      };
    }
  }
}

module.exports = new EmailService();
