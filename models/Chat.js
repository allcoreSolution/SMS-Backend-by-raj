// models/Chat.js
const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId
  },
  model: {
    type: String,
    enum: ['User', 'Staff', 'Student', 'Parent'],
    default: 'User'
  },
  name: { type: String, required: true, trim: true },
  role: { type: String, default: 'Member' },
  avatar: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' }
}, { _id: false });

const chatMessageSchema = new mongoose.Schema({
  threadId: { type: String, required: true, index: true },
  senderId: {
    type: mongoose.Schema.Types.ObjectId
  },
  senderModel: {
    type: String,
    enum: ['User', 'Staff', 'Student', 'Parent', 'System'],
    default: 'User'
  },
  sender: { type: String, required: true },
  senderRole: { type: String, default: 'Member' },
  senderAvatar: { type: String, default: '' },
  content: { type: String, default: '', maxlength: 10000 },
  channel: {
    type: String,
    enum: ['Chat', 'WhatsApp', 'System'],
    default: 'Chat'
  },
  isSelf: { type: Boolean, default: false },
  attachmentUrl: { type: String, default: '' },
  attachmentName: { type: String, default: '' },
  attachmentType: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null }
}, { timestamps: true });

const chatThreadSchema = new mongoose.Schema({
  threadId: { type: String, unique: true, required: true, index: true },
  name: { type: String, required: true, trim: true },
  avatar: { type: String, default: '' },
  role: { type: String, default: 'General' },
  isGroup: { type: Boolean, default: false },
  online: { type: Boolean, default: false },
  lastMsg: { type: String, default: '' },
  lastMsgAt: { type: Date, default: Date.now },
  unreadCount: { type: Number, default: 0 },
  isPinned: { type: Boolean, default: false },
  participants: { type: [participantSchema], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId },
  tenantId: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true });

const ChatMessage = mongoose.models.ChatMessage ||
  mongoose.model('ChatMessage', chatMessageSchema);

const ChatThread = mongoose.models.ChatThread ||
  mongoose.model('ChatThread', chatThreadSchema);

module.exports = { ChatMessage, ChatThread };
