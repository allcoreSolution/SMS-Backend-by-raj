const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // Don't return password by default
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: false, // SuperAdmin won't have a tenant
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  firstName: {
    type: String,
    default: '',
    trim: true,
  },
  lastName: {
    type: String,
    default: '',
    trim: true,
  },
  phone: {
    type: String,
    default: '',
    trim: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
    trim: true,
  },
  designation: {
    type: String,
    default: 'Administrator',
    trim: true,
  },
  department: {
    type: String,
    default: 'Management / IT',
    trim: true,
  },
  address: {
    type: String,
    default: '',
    trim: true,
  },
  city: {
    type: String,
    default: 'New Delhi',
    trim: true,
  },
  state: {
    type: String,
    default: 'Delhi',
    trim: true,
  },
  postalCode: {
    type: String,
    default: '110001',
    trim: true,
  },
  country: {
    type: String,
    default: 'India',
    trim: true,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  preferences: {
    systemAlerts: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true },
    dailySummaries: { type: Boolean, default: false },
    whatsappAlerts: { type: Boolean, default: true },
    supportTickets: { type: Boolean, default: true },
    newAdmissions: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'light' },
  },
  activityLog: [
    {
      action: { type: String, required: true },
      details: { type: String, default: '' },
      ip: { type: String, default: '127.0.0.1' },
      device: { type: String, default: 'Web Browser / Desktop' },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
