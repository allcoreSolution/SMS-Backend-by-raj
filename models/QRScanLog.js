const mongoose = require('mongoose');

const qrScanLogSchema = new mongoose.Schema({
  time: { type: Date, default: Date.now },
  outcome: { type: String, enum: ['Accepted', 'Blocked'], required: true },
  resultReason: { type: String }, // e.g., 'Success', 'Fake GPS Detected', 'Off Campus'
  operator: { type: String, default: 'System' },
  targetName: { type: String, required: true },
  targetType: { type: String, enum: ['Student', 'Staff'], required: true },
  mode: { type: String, default: 'QR' },
  location: { type: String, default: 'Main Gate' },
  device: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('QRScanLog', qrScanLogSchema);
