const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
  broadcastId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    default: function() {
      return `BC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  },
  subject: {
    type: String,
    required: [true, 'Broadcast subject is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Broadcast message body is required'],
    trim: true
  },
  channels: [{
    type: String,
    enum: ['Email', 'SMS', 'WhatsApp', 'Push Notification']
  }],
  targetAudience: {
    type: String,
    default: 'All (Entire School)'
  },
  targetClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicClass',
    default: null
  },
  targetClassName: {
    type: String,
    default: 'All Classes'
  },
  totalRecipients: {
    type: Number,
    default: 0
  },
  deliveryStats: {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['Sent', 'Delivered', 'Partial', 'Failed', 'Scheduled'],
    default: 'Delivered'
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  sentBy: {
    type: String,
    default: 'Principal / Admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('Broadcast', broadcastSchema);
