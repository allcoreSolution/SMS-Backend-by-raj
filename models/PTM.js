const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  studentId: { type: String },
  name: { type: String, required: true },
  roll: { type: String, default: '-' },
  className: { type: String, default: '' },
  guardianName: { type: String, default: '' },
  phone: { type: String, default: '' },
  slot: { type: String, default: '--' },
  notified: { type: String, default: '--' },
  attendance: { type: String, enum: ['Pending', 'Present', 'Absent'], default: 'Pending' },
  remarks: { type: String, default: '' },
  tags: [{ type: String }],
  followUpNeeded: { type: Boolean, default: false }
}, { _id: true });

const followUpSchema = new mongoose.Schema({
  student: { type: String, required: true },
  meeting: { type: String, default: '--' },
  actionPlan: { type: String, required: true },
  assignee: { type: String, default: 'Class Teacher' },
  due: { type: String, default: '' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'In Progress', 'Done', 'Cancelled'], default: 'Open' }
}, { timestamps: true });

const ptmSchema = new mongoose.Schema({
  title: { type: String, default: 'Parent-Teacher Meeting' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  meetingDate: { type: Date, required: true },
  startTime: { type: String, default: '09:00 AM' },
  endTime: { type: String, default: '01:00 PM' },
  mode: { type: String, enum: ['In person', 'Online', 'Hybrid'], default: 'In person' },
  scope: { type: String, default: 'Whole school' },
  className: { type: String, default: '' },
  sectionName: { type: String, default: '' },
  venue: { type: String, default: 'Main Campus' },
  meetingLink: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Draft', 'Scheduled', 'Notified', 'Completed', 'Cancelled'], default: 'Scheduled' },
  remarks: { type: String, default: '' },
  roster: [attendeeSchema],
  followUps: [followUpSchema]
}, { timestamps: true });

module.exports = mongoose.model('PTM', ptmSchema);
