const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const GlobalSetting = require('../models/GlobalSetting');

const AUTH_DIR = path.join(__dirname, '../whatsapp_auth');

class WhatsAppService {
  constructor() {
    this.sock = null;
    this.qr = null;
    this.qrImage = null;
    this.status = 'disconnected'; // 'disconnected' | 'connecting' | 'qr_ready' | 'connected'
    this.userPhone = null;
    this.userName = 'School Admin';
    this.isInitializing = false;
  }

  async init(forceNew = false) {
    if (this.isInitializing) return;
    this.isInitializing = true;

    try {
      if (forceNew && fs.existsSync(AUTH_DIR)) {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      }

      if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

      this.status = 'connecting';
      this.sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['School ERP Admin', 'Chrome', '124.0.0']
      });

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.qr = qr;
          this.status = 'qr_ready';
          try {
            this.qrImage = await QRCode.toDataURL(qr, { margin: 2, scale: 6 });
          } catch (e) {
            console.error('QR image generation error:', e);
          }
        }

        if (connection === 'close') {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          this.status = 'disconnected';
          this.qr = null;
          this.qrImage = null;
          this.userPhone = null;

          if (shouldReconnect) {
            console.log('WhatsApp reconnecting...');
            setTimeout(() => {
              this.isInitializing = false;
              this.init();
            }, 3000);
          } else {
            console.log('WhatsApp logged out.');
            if (fs.existsSync(AUTH_DIR)) {
              fs.rmSync(AUTH_DIR, { recursive: true, force: true });
            }
            this.isInitializing = false;
          }
        } else if (connection === 'open') {
          this.status = 'connected';
          this.qr = null;
          this.qrImage = null;

          const rawId = this.sock.user?.id || '';
          this.userPhone = rawId.split(':')[0] || rawId.split('@')[0];
          this.userName = this.sock.user?.name || 'School Admin';

          console.log(`✅ WhatsApp Connected successfully as +${this.userPhone} (${this.userName})`);

          // Update DB record
          try {
            await GlobalSetting.findOneAndUpdate(
              { key: 'admin_whatsapp_session' },
              {
                key: 'admin_whatsapp_session',
                value: {
                  isConnected: true,
                  phone: this.userPhone,
                  displayPhone: `+${this.userPhone}`,
                  name: this.userName,
                  linkedAt: new Date(),
                  deviceInfo: 'WhatsApp Web Multi-Device'
                }
              },
              { upsert: true }
            );
          } catch (err) {
            console.warn('DB session save warning:', err.message);
          }
        }
      });

      this.sock.ev.on('creds.update', saveCreds);

    } catch (err) {
      console.error('WhatsApp Init Error:', err);
      this.status = 'disconnected';
    } finally {
      this.isInitializing = false;
    }
  }

  getStatus() {
    return {
      status: this.status,
      isConnected: this.status === 'connected',
      qrImage: this.qrImage,
      phone: this.userPhone,
      name: this.userName
    };
  }

  async requestPairingCode(phone) {
    if (!this.sock) {
      await this.init();
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    try {
      const code = await this.sock.requestPairingCode(cleanPhone);
      return { success: true, pairingCode: code };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async sendMessage(phone, text) {
    if (this.status !== 'connected' || !this.sock) {
      return { success: false, error: 'WhatsApp is not connected. Please scan QR code first.' };
    }

    try {
      let cleanPhone = phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

      const jid = `${cleanPhone}@s.whatsapp.net`;
      const result = await this.sock.sendMessage(jid, { text });
      return { success: true, messageId: result?.key?.id, jid };
    } catch (err) {
      console.error('Error sending WhatsApp message:', err);
      return { success: false, error: err.message };
    }
  }

  async logout() {
    try {
      if (this.sock) {
        await this.sock.logout().catch(() => {});
        this.sock.end();
      }
    } catch (e) {}

    this.sock = null;
    this.status = 'disconnected';
    this.qr = null;
    this.qrImage = null;
    this.userPhone = null;

    if (fs.existsSync(AUTH_DIR)) {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    }

    await GlobalSetting.findOneAndUpdate(
      { key: 'admin_whatsapp_session' },
      { key: 'admin_whatsapp_session', value: { isConnected: false, phone: '' } },
      { upsert: true }
    );

    // Re-initialize to generate a fresh QR
    setTimeout(() => this.init(), 1000);
    return { success: true };
  }
}

const instance = new WhatsAppService();
// Automatically start Baileys in background on server boot
instance.init();

module.exports = instance;
