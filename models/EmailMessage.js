const mongoose = require('mongoose');

const emailAttachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: String, default: '150 KB' },
  type: { type: String, default: 'application/pdf' },
  url: { type: String, default: '#' }
}, { _id: false });

const emailMessageSchema = new mongoose.Schema({
  mailId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    default: function() {
      return `EML-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    }
  },
  sender: {
    type: String,
    required: true,
    trim: true
  },
  senderEmail: {
    type: String,
    required: true,
    trim: true
  },
  recipient: {
    type: String,
    required: true,
    trim: true
  },
  recipientEmail: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  studentName: {
    type: String,
    default: 'Aarav Sharma'
  },
  className: {
    type: String,
    default: 'Class I (A)'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  preview: {
    type: String,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Fees', 'Academics', 'Notices', 'Attendance', 'Health', 'Events', 'General'],
    default: 'General'
  },
  folder: {
    type: String,
    enum: ['inbox', 'sent', 'archive', 'trash'],
    default: 'inbox'
  },
  priority: {
    type: String,
    enum: ['High', 'Normal', 'Low'],
    default: 'Normal'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isTrash: {
    type: Boolean,
    default: false
  },
  direction: {
    type: String,
    enum: ['incoming', 'outgoing'],
    default: 'incoming'
  },
  attachments: [emailAttachmentSchema],
  sentAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

emailMessageSchema.index({ studentId: 1, folder: 1, sentAt: -1 });
emailMessageSchema.index({ recipientEmail: 1, isTrash: 1 });

module.exports = mongoose.model('EmailMessage', emailMessageSchema);
