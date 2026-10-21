const mongoose = require('mongoose');

// ID Card Template Schema
const idCardTemplateSchema = new mongoose.Schema({
  templateId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  cardType: {
    type: String,
    enum: ['Student', 'Staff', 'Visitor', 'All'],
    default: 'Student'
  },
  orientation: {
    type: String,
    enum: ['Portrait', 'Landscape'],
    default: 'Portrait'
  },
  dimensions: {
    type: String,
    default: '54 x 85.6 mm (CR80 Standard)'
  },
  themeColor: {
    type: String,
    default: '#5F52FF'
  },
  accentColor: {
    type: String,
    default: '#E9E7FF'
  },
  inkColor: {
    type: String,
    default: '#1E1B4B'
  },
  schoolName: {
    type: String,
    default: 'Greenwood International School'
  },
  schoolTagline: {
    type: String,
    default: 'Affiliated to CBSE | Affiliation No: 2130894'
  },
  schoolAddress: {
    type: String,
    default: 'Sector 12, Knowledge Park, New Delhi - 110001'
  },
  schoolPhone: {
    type: String,
    default: '+91 98765 43210'
  },
  schoolLogo: {
    type: String,
    default: ''
  },
  principalSignText: {
    type: String,
    default: 'Authorized Signature'
  },
  fieldsIncluded: {
    photo: { type: Boolean, default: true },
    bloodGroup: { type: Boolean, default: true },
    emergencyContact: { type: Boolean, default: true },
    address: { type: Boolean, default: true },
    barcode: { type: Boolean, default: true },
    qrCode: { type: Boolean, default: true },
    validityYear: { type: Boolean, default: true },
    rollNo: { type: Boolean, default: true },
    admissionNo: { type: Boolean, default: true },
    dob: { type: Boolean, default: true }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Generated / Issued ID Card Schema
const generatedIdCardSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  templateId: {
    type: String,
    required: true
  },
  templateTitle: {
    type: String,
    default: 'Standard ID'
  },
  personType: {
    type: String,
    enum: ['Student', 'Staff'],
    required: true
  },
  personId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'personModel',
    required: true
  },
  personModel: {
    type: String,
    required: true,
    enum: ['Student', 'Staff']
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  idNumber: {
    type: String,
    required: true,
    trim: true
  },
  rollNo: {
    type: String,
    default: '-'
  },
  admissionNo: {
    type: String,
    default: '-'
  },
  className: {
    type: String,
    default: '-'
  },
  sectionName: {
    type: String,
    default: '-'
  },
  designation: {
    type: String,
    default: '-'
  },
  department: {
    type: String,
    default: '-'
  },
  bloodGroup: {
    type: String,
    default: 'Unknown'
  },
  dob: {
    type: String,
    default: '-'
  },
  gender: {
    type: String,
    default: '-'
  },
  phone: {
    type: String,
    default: '-'
  },
  emergencyContact: {
    type: String,
    default: '-'
  },
  address: {
    type: String,
    default: 'Knowledge Park, New Delhi'
  },
  photoUrl: {
    type: String,
    default: ''
  },
  qrCodeData: {
    type: String,
    default: ''
  },
  barcodeData: {
    type: String,
    default: ''
  },
  academicSession: {
    type: String,
    default: '2026-2027'
  },
  validUntil: {
    type: String,
    default: '31-Mar-2027'
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Printed', 'Expired', 'Revoked'],
    default: 'Active'
  },
  printedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const IdCardTemplate = mongoose.model('IdCardTemplate', idCardTemplateSchema);
const GeneratedIdCard = mongoose.model('GeneratedIdCard', generatedIdCardSchema);

module.exports = {
  IdCardTemplate,
  GeneratedIdCard
};
