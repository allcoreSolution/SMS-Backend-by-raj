const mongoose = require('mongoose');

// 1. Certificate Template Schema
const certificateTemplateSchema = new mongoose.Schema({
  templateId: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Student', 'Staff', 'Admit Card', 'Report Card', 'Fee Receipt', 'Merit'], 
    default: 'Student' 
  },
  layout: { type: String, enum: ['Portrait', 'Landscape'], default: 'Landscape' },
  paperSize: { type: String, enum: ['A4', 'A5', 'Letter'], default: 'A4' },
  schoolName: { type: String, default: 'ALL CORE SOLUTIONS' },
  schoolAffiliation: { type: String, default: 'Affiliated to CBSE, New Delhi | Affiliation No: 2130892' },
  schoolAddress: { type: String, default: 'Institutional Area, Sector 4, New Delhi - 110001' },
  headerSubtitle: { type: String, default: 'TO WHOMSOEVER IT MAY CONCERN' },
  bodyTemplate: { type: String, required: true },
  primaryColor: { type: String, default: '#1e3a8a' }, // Navy blue
  accentColor: { type: String, default: '#f59e0b' },  // Gold
  signatoryTitle1: { type: String, default: 'Class Teacher' },
  signatoryTitle2: { type: String, default: 'Principal / Head of Institution' },
  isSystemDefault: { type: Boolean, default: false }
}, { timestamps: true });

// 2. Issued / Archived Certificate Record Schema
const issuedCertificateSchema = new mongoose.Schema({
  certificateNumber: { type: String, required: true, unique: true },
  templateId: { type: String, required: true },
  templateTitle: { type: String, required: true },
  certificateType: { type: String, default: 'Student' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, required: true },
  admissionNo: { type: String, default: '' },
  rollNo: { type: String, default: '' },
  className: { type: String, default: 'Class X' },
  sectionName: { type: String, default: 'A' },
  fatherName: { type: String, default: '' },
  motherName: { type: String, default: '' },
  academicYear: { type: String, default: '2026-2027' },
  issueDate: { type: Date, default: Date.now },
  renderedContent: { type: String, required: true },
  issuedBy: { type: String, default: 'Office of the Principal' },
  status: { type: String, enum: ['Generated', 'Printed', 'Revoked'], default: 'Generated' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

// Backward compatible Certificate model
const certificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  certificateType: { type: String, enum: ['Transfer', 'Character', 'Bonafide', 'Sports', 'Merit'], required: true },
  issueDate: { type: Date, default: Date.now },
  referenceNumber: { type: String, unique: true },
  remarks: { type: String },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

const CertificateTemplate = mongoose.model('CertificateTemplate', certificateTemplateSchema);
const IssuedCertificate = mongoose.model('IssuedCertificate', issuedCertificateSchema);
const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = {
  CertificateTemplate,
  IssuedCertificate,
  Certificate
};
