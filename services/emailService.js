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
    let host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
    let port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
    let secure = process.env.SMTP_SECURE === 'true' || process.env.EMAIL_SECURE === 'true' || port === 465;
    let user = process.env.SMTP_USER || process.env.EMAIL_USER || '';
    let pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';

    // Check if SMTP settings exist in GlobalSetting DB (if not fully provided in env and DB is connected)
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection && mongoose.connection.readyState === 1 && (!user || !pass)) {
        const dbSetting = await GlobalSetting.findOne({ key: 'smtp_settings' }).maxTimeMS(1500);
        if (dbSetting && dbSetting.value) {
          if (dbSetting.value.host) host = dbSetting.value.host;
          if (dbSetting.value.port) port = parseInt(dbSetting.value.port, 10);
          if (dbSetting.value.secure !== undefined) secure = dbSetting.value.secure;
          if (dbSetting.value.user || dbSetting.value.username) user = dbSetting.value.user || dbSetting.value.username;
          if (dbSetting.value.pass || dbSetting.value.password) pass = dbSetting.value.pass || dbSetting.value.password;
        }
      }
    } catch (err) {
      // Ignore DB lookup fallback
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
      const senderFrom = from || process.env.EMAIL_FROM || (process.env.EMAIL_USER ? `School ERP <${process.env.EMAIL_USER}>` : (process.env.SMTP_USER ? `School ERP <${process.env.SMTP_USER}>` : '"School ERP" <helpdesk@allcoresolution.com>'));

      if (!transporter) {
        console.warn(`[EmailService] ⚠️ SMTP credentials not configured in .env. Live email to <${to}> cannot be delivered via SMTP.`);
        return {
          delivered: false,
          reason: 'SMTP_CREDENTIALS_MISSING',
          message: 'SMTP credentials not configured in server environment.'
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
          <h2 style="color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">School ERP - Official Mail Desk</h2>
          <p style="white-space: pre-wrap;">${text}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #64748b;">This email was sent from the School ERP Communications Desk.</p>
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

  /**
   * Send Password Reset OTP with high-end responsive HTML template
   */
  async sendPasswordResetOtp({ to, otp, userName = 'User' }) {
    const subject = `🔐 Your School ERP Password Reset OTP: ${otp}`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Password Reset OTP</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
          <!-- Top Header Accent -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #ff5c0a, #6366f1, #0ea5e9);"></td>
          </tr>
          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #fff7ed; border: 1px solid #ffedd5; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; color: #ea580c; margin-bottom: 16px;">
                      🛡️ School ERP Security Desk
                    </div>
                    <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.25;">
                      Password Reset Request
                    </h1>
                    <p style="margin: 0 0 20px; font-size: 14px; color: #475569; line-height: 1.6;">
                      Hello <strong>${userName}</strong>,<br>
                      We received a request to reset the password for your School ERP account. Use the one-time verification code (OTP) below to proceed with resetting your password:
                    </p>
                  </td>
                </tr>
                <!-- OTP Box -->
                <tr>
                  <td align="center" style="padding: 10px 0 24px;">
                    <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #cbd5e1; border-radius: 14px; padding: 20px 28px; display: inline-block; text-align: center;">
                      <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 1.5px; margin-bottom: 6px;">Your 6-Digit OTP Code</span>
                      <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', Courier, monospace;">${otp}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin: 0 0 16px; font-size: 13px; color: #64748b; line-height: 1.5; background-color: #f8fafc; padding: 12px 16px; border-radius: 10px; border-left: 3px solid #ff5c0a;">
                      ⏱️ <strong>Validity:</strong> This code is valid for <strong>15 minutes</strong>. Never share this OTP with anyone, including school staff.
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                      If you did not request a password reset, you can safely ignore this email. Your account remains secure and your password has not been changed.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; color: #475569;">
                School ERP Ecosystem • Automated Security Verification
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                Developed by RAJ YADAV @ALLCORE SOLUTION
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    const text = `Your School ERP password reset OTP code is: ${otp}. It is valid for 15 minutes. If you did not request this, please ignore this email.`;

    return this.sendMail({
      to,
      subject,
      text,
      html
    });
  }
}

module.exports = new EmailService();
