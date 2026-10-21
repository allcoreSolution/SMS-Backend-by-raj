const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Parent / Guardian name is required'],
    trim: true,
  },
  relation: {
    type: String,
    enum: ['Father', 'Mother', 'Guardian'],
    default: 'Father',
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  occupation: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    trim: true,
    default: '',
  },
  loginId: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    default: 'secret_access_24',
    trim: true,
  },
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    }
  ],
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Parent', parentSchema);
