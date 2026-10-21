const mongoose = require('mongoose');

// 1. Settings Schema
const chatModerationSettingSchema = new mongoose.Schema({
  chatEnabled: { type: Boolean, default: true },
  teacherStudentEnabled: { type: Boolean, default: true },
  teacherParentEnabled: { type: Boolean, default: true },
  studentStudentEnabled: { type: Boolean, default: false },
  restrictedHours: {
    enabled: { type: Boolean, default: false },
    startTime: { type: String, default: "08:00" },
    endTime: { type: String, default: "18:00" }
  },
  autoFilterProfanity: { type: Boolean, default: true },
  blockPhoneNumbers: { type: Boolean, default: true },
  flaggedKeywords: {
    type: [String],
    default: ["idiot", "cheat", "stupid", "bribe", "harass", "leak", "paper", "exam leak", "abuse"]
  },
  notificationEmail: { type: String, default: "safety@greenwood.edu" }
}, { timestamps: true });

// 2. Moderated Message Sub-Schema
const moderatedMessageSchema = new mongoose.Schema({
  messageId: { type: String, required: true },
  sender: { type: String, required: true },
  senderRole: { type: String, enum: ['Teacher', 'Parent', 'Student', 'Admin'], default: 'Teacher' },
  content: { type: String, required: true },
  originalContent: { type: String },
  isAuditRemoved: { type: Boolean, default: false },
  removedBy: { type: String },
  removedReason: { type: String },
  removedAt: { type: Date },
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// 3. Admin Notes Sub-Schema
const adminNoteSchema = new mongoose.Schema({
  author: { type: String, default: 'Administrator' },
  note: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 4. Moderated Conversation Schema
const moderatedConversationSchema = new mongoose.Schema({
  conversationId: { type: String, unique: true, required: true },
  teacherName: { type: String, required: true },
  withUserName: { type: String, required: true },
  studentName: { type: String, required: true },
  type: { type: String, enum: ['Parent', 'Student', 'Staff'], default: 'Student' },
  className: { type: String, default: 'Class 10 - A' },
  section: { type: String, default: 'A' },
  startedAt: { type: Date, default: Date.now },
  lastMsg: { type: String, default: '' },
  lastActivity: { type: String, default: 'Just now' },
  lastActivityAt: { type: Date, default: Date.now },
  isLocked: { type: Boolean, default: false },
  lockReason: { type: String, default: '' },
  lockedAt: { type: Date },
  lockedBy: { type: String },
  flagCount: { type: Number, default: 0 },
  severity: { type: String, enum: ['Normal', 'Warning', 'Critical'], default: 'Normal' },
  messages: [moderatedMessageSchema],
  adminNotes: [adminNoteSchema]
}, { timestamps: true });

// 5. Abuse / Safety Incident Report Schema
const moderationReportSchema = new mongoose.Schema({
  reportId: { type: String, unique: true, required: true },
  conversationId: { type: String, required: true },
  studentName: { type: String, required: true },
  teacherName: { type: String, required: true },
  reportedBy: { type: String, required: true },
  reporterRole: { type: String, default: 'Teacher' },
  reason: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'Reviewed', 'Resolved', 'Dismissed'], default: 'Pending' },
  actionTaken: { type: String, default: '' },
  resolvedAt: { type: Date },
  resolvedBy: { type: String }
}, { timestamps: true });

const ChatModerationSetting = mongoose.model('ChatModerationSetting', chatModerationSettingSchema);
const ModeratedConversation = mongoose.model('ModeratedConversation', moderatedConversationSchema);
const ModerationReport = mongoose.model('ModerationReport', moderationReportSchema);

module.exports = {
  ChatModerationSetting,
  ModeratedConversation,
  ModerationReport
};
