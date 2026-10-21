const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  parentName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String },
  targetClass: { type: String, required: true },
  source: { type: String, default: 'Website' },
  status: { type: String, default: 'New Enquiry' },
  stage: { type: String, default: 'New Enquiry' },
  followUpDate: { type: Date },
  followUpType: { type: String, default: 'Call' },
  followUpTitle: { type: String },
  followUpStatus: { type: String, default: 'pending' },
  score: { type: Number, default: 50 },
  notes: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  assignedStaffName: { type: String },
  convertedStudentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  schoolId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);

