const mongoose = require('mongoose');

// 1. School Compliance Profile & Global Settings
const complianceProfileSchema = new mongoose.Schema({
  tenantId: { type: String, default: 'default' },
  udiseCode: { type: String, default: '09010405101' },
  schoolName: { type: String, default: 'St. Xavier International Academy' },
  affiliationNo: { type: String, default: 'CBSE/AFF/2130892' },
  recognitionNo: { type: String, default: 'REC-EDU-2018-994' },
  recognitionDate: { type: Date, default: () => new Date('2018-04-01') },
  managementType: { type: String, default: 'Private Unaided' },
  schoolCategory: { type: String, default: 'Higher Secondary (I–XII)' },
  board: { type: String, default: 'India — CBSE' },
  minorityGroup: { type: String, default: 'Non-Minority' },
  yearEstablished: { type: String, default: '2008' },
  principalName: { type: String, default: 'Dr. Anandita Verma' },
  principalPhone: { type: String, default: '+91 98765 43210' },
  nodalOfficer: { type: String, default: 'Rajesh Kumar (Senior Registrar)' },
  mediumOfInstruction: {
    english: { type: Boolean, default: true },
    hindi: { type: Boolean, default: true },
    regional: { type: Boolean, default: false },
    other: { type: Boolean, default: false }
  },
  installedPacks: {
    type: [String],
    default: ['india-cbse', 'generic']
  },
  fieldSettings: {
    student: {
      type: Map,
      of: Boolean,
      default: {
        'Aadhaar Number': true,
        'APAAR / PEN ID': true,
        'Caste Category': true,
        'Sub Caste': false,
        'BPL Status': false,
        'RTE 25% Quota': true,
        'Father Aadhaar': true,
        'Mother Aadhaar': true,
        'Blood Group': true,
        'Religion': true,
        'CWSN Status': true,
        'Disability Certificate': false
      }
    },
    teacher: {
      type: Map,
      of: Boolean,
      default: {
        'Teacher Aadhaar': true,
        'Teacher TET Qualified': true,
        'Highest Professional Degree': true,
        'Police Verification Status': true,
        'Service Book Maintained': true
      }
    }
  }
}, { timestamps: true });

// 2. Statutory Document Vault Item
const complianceDocumentSchema = new mongoose.Schema({
  tenantId: { type: String, default: 'default' },
  ownerType: {
    type: String,
    enum: ['School', 'Teacher', 'Student', 'Transport', 'Campus'],
    default: 'School'
  },
  category: {
    type: String,
    enum: [
      'Building Safety',
      'Fire Safety',
      'Water & Sanitation',
      'Recognition Certificate',
      'CBSE Affiliation / SARAS',
      'Land & Lease Title',
      'Society / Trust Registration',
      'RTE 25% Compliance',
      'Staff Police Verification',
      'Transport Fitness & Permit',
      'Food Safety / FSSAI',
      'Other'
    ],
    default: 'Building Safety'
  },
  title: { type: String, required: true },
  docNo: { type: String, default: '' },
  issuingAuthority: { type: String, default: '' },
  issueDate: { type: Date, default: null },
  expiryDate: { type: Date, default: null },
  status: {
    type: String,
    enum: ['Valid', 'Expiring Soon', 'Expired', 'Under Renewal', 'Missing'],
    default: 'Valid'
  },
  remindDays: {
    type: [Number],
    default: [60, 30, 14, 7]
  },
  notes: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  verified: { type: Boolean, default: true }
}, { timestamps: true });

// 3. Inspection & Governance Checklist Item
const complianceChecklistSchema = new mongoose.Schema({
  tenantId: { type: String, default: 'default' },
  code: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'Statutory Approvals',
      'Safety & Infrastructure',
      'Academic Standards & NEP 2020',
      'Student Welfare & Protection',
      'Staff Governance & Service',
      'Affiliation & Annual Returns'
    ],
    default: 'Statutory Approvals'
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: {
    type: String,
    enum: ['Critical', 'Mandatory', 'Recommended'],
    default: 'Mandatory'
  },
  status: {
    type: String,
    enum: ['Compliant', 'Pending', 'In Progress', 'Non-Compliant'],
    default: 'Compliant'
  },
  assignedTo: { type: String, default: 'Principal' },
  dueDate: { type: Date, default: null },
  lastAuditedDate: { type: Date, default: Date.now },
  remarks: { type: String, default: '' }
}, { timestamps: true });

// 4. Statutory Compliance Calendar Event
const complianceCalendarEventSchema = new mongoose.Schema({
  tenantId: { type: String, default: 'default' },
  title: { type: String, required: true },
  category: { type: String, default: 'Statutory Renewal' },
  authority: { type: String, default: 'Education Department' },
  dueDate: { type: Date, required: true },
  priority: {
    type: String,
    enum: ['Urgent', 'High', 'Medium', 'Low'],
    default: 'High'
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Completed', 'Overdue'],
    default: 'Upcoming'
  },
  notes: { type: String, default: '' }
}, { timestamps: true });

const ComplianceProfile = mongoose.model('ComplianceProfile', complianceProfileSchema);
const ComplianceDocument = mongoose.model('ComplianceDocument', complianceDocumentSchema);
const ComplianceChecklist = mongoose.model('ComplianceChecklist', complianceChecklistSchema);
const ComplianceCalendarEvent = mongoose.model('ComplianceCalendarEvent', complianceCalendarEventSchema);

module.exports = {
  ComplianceProfile,
  ComplianceDocument,
  ComplianceChecklist,
  ComplianceCalendarEvent
};
