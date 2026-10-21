const mongoose = require('mongoose');

// ======================== VISITOR SCHEMA ========================
const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  purpose: { type: String, required: true, trim: true },
  meetingWith: { type: String, required: true, trim: true },
  visitorType: { 
    type: String, 
    enum: ['Parent', 'Vendor', 'Guest', 'Official', 'Other'], 
    default: 'Parent' 
  },
  idProof: { type: String, default: 'Aadhaar Card' },
  idNumber: { type: String, default: '' },
  badgeNumber: { type: String, default: '' },
  numberOfPersons: { type: Number, default: 1 },
  inTime: { type: Date, default: Date.now },
  outTime: { type: Date, default: null },
  status: { type: String, enum: ['On Campus', 'Checked Out', 'In', 'Out'], default: 'On Campus' },
  notes: { type: String, default: '' }
}, { timestamps: true });

// ======================== COMPLAINT SCHEMA ========================
const complaintSchema = new mongoose.Schema({
  subject: { type: String, trim: true, default: '' },
  complainantName: { type: String, default: 'Staff Faculty', trim: true },
  phone: { type: String, default: '' },
  complaintType: { 
    type: String, 
    default: 'Other' 
  },
  category: { type: String, default: 'Other' },
  against: { type: String, default: '' },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' },
  priority: { type: String, default: 'Medium' },
  assignedTo: { type: String, default: 'Administrative Officer' },
  actionTaken: { type: String, default: '' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  teacherName: { type: String, default: '' }
}, { timestamps: true, strict: false });

// ======================== ADMISSION ENQUIRY SCHEMA ========================
const admissionEnquirySchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true },
  parentName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, default: '' },
  classApplied: { type: String, required: true, trim: true }, // e.g. "Class I", "Nursery"
  source: { 
    type: String, 
    enum: ['Online Website', 'Walk-in Reception', 'Referral', 'Newspaper Ad', 'Social Media', 'Direct Call'], 
    default: 'Walk-in Reception' 
  },
  enquiryDate: { type: Date, default: Date.now },
  nextFollowUp: { type: Date },
  status: { 
    type: String, 
    enum: ['Pending', 'Followed-up', 'Admitted', 'Lost', 'Under Review'], 
    default: 'Pending' 
  },
  assignedTo: { type: String, default: 'Counselor Ananya' },
  notes: { type: String, default: '' }
}, { timestamps: true });

// ======================== POSTAL RECORD SCHEMA ========================
const postalRecordSchema = new mongoose.Schema({
  type: { type: String, enum: ['Dispatch', 'Receive'], required: true },
  fromTitle: { type: String, required: true, trim: true },
  toTitle: { type: String, required: true, trim: true },
  referenceNo: { type: String, required: true, trim: true },
  address: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  confidential: { type: Boolean, default: false },
  postalProvider: { type: String, default: 'Speed Post / Courier' },
  notes: { type: String, default: '' }
}, { timestamps: true });

// ======================== GATE PASS SCHEMA ========================
const gatePassSchema = new mongoose.Schema({
  passNo: { type: String, required: true, unique: true, trim: true },
  personType: { type: String, enum: ['Student', 'Staff', 'Visitor'], default: 'Student' },
  personName: { type: String, required: true, trim: true },
  classSection: { type: String, default: '' }, // e.g. "Class II A"
  reason: { 
    type: String, 
    required: true,
    enum: ['Sick / unwell', 'Doctor appointment', 'Parent pickup', 'Official duty', 'Personal emergency', 'Other'],
    default: 'Parent pickup' 
  },
  authorizedBy: { type: String, default: 'Principal Office' },
  outTime: { type: Date, default: Date.now },
  expectedReturnTime: { type: Date },
  actualReturnTime: { type: Date },
  status: { 
    type: String, 
    enum: ['Approved', 'Out', 'Returned', 'Cancelled', 'Pending', 'Rejected'], 
    default: 'Approved' 
  },
  notes: { type: String, default: '' }
}, { timestamps: true });

// ======================== CAMPUS WORKER SCHEMA ========================
const campusWorkerSchema = new mongoose.Schema({
  badgeNo: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  type: { 
    type: String, 
    enum: ['Housekeeping', 'Security', 'Maintenance', 'Gardener', 'Driver', 'Electrician', 'Catering'], 
    default: 'Housekeeping' 
  },
  contractor: { type: String, default: 'Campus Facilities Service' },
  validDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  policeCheck: { type: String, enum: ['Verified', 'Not verified', 'Pending'], default: 'Verified' },
  state: { type: String, enum: ['Active', 'Expired', 'Blocked'], default: 'Active' },
  logs: [{
    inTime: { type: Date, default: Date.now },
    outTime: { type: Date },
    gate: { type: String, default: 'Main Gate 1' }
  }]
}, { timestamps: true });

// ======================== SCHOOL APPOINTMENT SCHEMA ========================
const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true, trim: true },
  visitorName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, default: 'Aarav Sharma' },
  className: { type: String, default: 'Class I (A)' },
  relation: { type: String, default: 'Father' },
  purpose: { type: String, required: true, trim: true },
  meetingWith: { type: String, required: true, trim: true },
  visitDate: { type: Date, required: true },
  visitTime: { type: String, required: true },
  venue: { type: String, default: 'Visitors Conference Room (#F-12)' },
  numberOfPersons: { type: Number, default: 1 },
  passNumber: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled by Parent', 'Rescheduled', 'Pending'],
    default: 'Confirmed'
  },
  specialNotes: { type: String, default: '' },
  adminRemarks: { type: String, default: '' }
}, { timestamps: true });

const Visitor = mongoose.model('Visitor', visitorSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);
const AdmissionEnquiry = mongoose.model('AdmissionEnquiry', admissionEnquirySchema);
const PostalRecord = mongoose.model('PostalRecord', postalRecordSchema);
const GatePass = mongoose.model('GatePass', gatePassSchema);
const CampusWorker = mongoose.model('CampusWorker', campusWorkerSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = {
  Visitor,
  Complaint,
  AdmissionEnquiry,
  PostalRecord,
  GatePass,
  CampusWorker,
  Appointment
};
