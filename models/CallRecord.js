const mongoose = require('mongoose');

const callRecordSchema = new mongoose.Schema({
  callId: { type: String, unique: true, required: true, index: true },
  callerName: { type: String, default: 'Super Admin' },
  callerRole: { type: String, default: 'Staff Admin' },
  receiverName: { type: String, required: true },
  receiverRole: { type: String, default: 'Member' },
  receiverPhone: { type: String },
  channelName: { type: String },
  callType: { type: String, enum: ['video', 'audio', 'phone'], default: 'audio' },
  status: { type: String, enum: ['connected', 'completed', 'missed', 'declined', 'failed'], default: 'completed' },
  durationSeconds: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('CallRecord', callRecordSchema);
