const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half-Day'], required: true },
  academicClass: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass', required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSection', required: true },
  remarks: { type: String }
}, { timestamps: true });

// Ensure a student has only one attendance record per day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
