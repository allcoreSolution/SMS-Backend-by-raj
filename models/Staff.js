const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  // Login & Role Information
  fullName: {
    type: String,
    required: [true, 'Full Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'Role is required'],
  },

  // Academic Master
  staffId: {
    type: String,
    required: [true, 'Staff ID is required'],
    unique: true,
    trim: true,
  },
  biometricId: {
    type: String,
    trim: true,
  },
  deviceMappingId: {
    type: String,
    trim: true,
  },

  // Personal & Work Details
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other', 'Select'],
  },
  dateOfBirth: {
    type: Date,
  },
  dateOfJoining: {
    type: Date,
  },
  confirmationDate: {
    type: Date,
  },
  employeeCode: {
    type: String,
    trim: true,
  },
  employmentType: {
    type: String,
    trim: true,
  },
  reportingManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null,
  },
  fathersName: {
    type: String,
    trim: true,
  },
  mothersName: {
    type: String,
    trim: true,
  },
  emergencyContactName: {
    type: String,
    trim: true,
  },
  emergencyContactPhone: {
    type: String,
    trim: true,
  },
  bloodGroup: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  maritalStatus: {
    type: String,
    trim: true,
  },
  qualification: {
    type: String,
    trim: true,
  },
  workExperience: {
    type: String,
    trim: true,
  },
  currentAddress: {
    type: String,
    trim: true,
  },
  note: {
    type: String,
    trim: true,
  },
  photo: {
    type: String, // file path URL
    default: null,
  },

  // Bank Details
  bankDetails: {
    accountTitle: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    bankName: { type: String, trim: true },
    branchName: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
  },

  // Extra JSON fields for Statutory IDs, Social Media, Additional Info
  statutoryIds: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  socialMedia: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  additionalInfo: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Staff', staffSchema);
