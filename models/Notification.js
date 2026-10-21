const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['exam', 'leave', 'attendance', 'message', 'hpc', 'system', 'admission'],
    default: 'system'
  },
  priority: {
    type: String,
    enum: ['normal', 'high', 'urgent'],
    default: 'normal'
  },
  targetRole: {
    type: String,
    default: 'Teacher'
  },
  link: {
    type: String,
    default: '/'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
