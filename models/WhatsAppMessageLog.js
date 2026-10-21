const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'accepted', 'sent', 'delivered', 'read', 'failed'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  }
}, { _id: false });

const whatsAppMessageLogSchema = new mongoose.Schema({
  wamid: {
    type: String,
    index: true,
    sparse: true
  },
  phone: {
    type: String,
    required: true,
    index: true
  },
  recipientName: {
    type: String,
    default: 'Recipient'
  },
  senderName: {
    type: String,
    default: 'School Admin'
  },
  threadId: {
    type: String,
    index: true
  },
  messageType: {
    type: String,
    enum: ['text', 'template'],
    default: 'text'
  },
  content: {
    type: String
  },
  templateName: {
    type: String
  },
  languageCode: {
    type: String,
    default: 'en_US'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending',
    index: true
  },
  errorCode: {
    type: Number
  },
  errorMessage: {
    type: String
  },
  errorDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  statusHistory: [statusHistorySchema],
  rawProviderResponse: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WhatsAppMessageLog', whatsAppMessageLogSchema);
