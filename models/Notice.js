const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  noticeNumber: {
    type: String,
    trim: true,
    default: function() {
      return `NOT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  },
  title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Notice content is required'],
    trim: true
  },
  sentTo: {
    type: String,
    default: 'All (Entire School)'
  },
  targetAudience: {
    type: String,
    enum: ['All', 'Student', 'Teacher', 'Parent', 'Driver', 'Employee', 'Staff'],
    default: 'All'
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
  priority: {
    type: String,
    enum: ['Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  attachmentUrl: {
    type: String,
    default: ''
  },
  createdByRole: {
    type: String,
    default: 'Principal Office'
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
