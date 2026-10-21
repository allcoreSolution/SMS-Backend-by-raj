const mongoose = require('mongoose');

const deviceRegistrySchema = new mongoose.Schema({
  deviceName: { type: String, required: true },
  ipAddress: { type: String, required: true },
  deviceType: { type: String, enum: ['Biometric', 'CCTV', 'Face Recognition', 'Fingerprint'], default: 'Biometric' },
  integrationMode: { type: String, enum: ['agent', 'cloud', 'camera'], default: 'cloud' },
  brand: { type: String, default: 'ZKTeco' },
  serialNumber: { type: String, default: '' },
  location: { type: String, required: true }, // e.g., 'Main Gate', 'Admin Block', 'Hostel Turnstile'
  streamUrl: { type: String, default: '' }, // For CCTV / RTSP links
  port: { type: Number, default: 4370 },
  commKey: { type: String, default: '0' },
  status: { type: String, enum: ['Online', 'Offline', 'Maintenance', 'Syncing'], default: 'Online' },
  todayPunches: { type: Number, default: 0 },
  lastSync: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DeviceRegistry', deviceRegistrySchema);
