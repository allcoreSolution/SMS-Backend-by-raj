const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  applicantType: { type: String, enum: ['Staff', 'Student'], required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  leaveType: { type: String, required: true }, // e.g., Sick, Casual, Earned
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  leaveCode: { type: String, trim: true },
  daysCount: { type: Number, default: 1 },
  appliedBy: { type: String, default: 'Parent' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: { type: String },
  attachmentUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
