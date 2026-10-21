const mongoose = require('mongoose');

const studentEntrySchema = new mongoose.Schema({
  studentId: { type: String, default: '' },
  studentName: { type: String, required: true },
  admissionNo: { type: String, default: '' },
  rollNo: { type: String, default: '' },
  marksObtained: { type: Number, default: 0 },
  maxMarks: { type: Number, default: 25 },
  percentage: { type: Number, default: 0 },
  grade: { type: String, default: 'B' },
  status: { type: String, enum: ['Present', 'Absent', 'Exempt'], default: 'Present' },
  teacherRemarks: { type: String, default: '' }
}, { _id: true });

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    enum: ['Quiz', 'Unit Test', 'Periodic Test', 'Assignment', 'Viva / Oral', 'Practical', 'Diagnostic'], 
    default: 'Quiz' 
  },
  classSec: { type: String, required: true, trim: true }, // e.g. "Class 10-A"
  subject: { type: String, required: true, trim: true }, // e.g. "Mathematics"
  totalMarks: { type: Number, required: true, default: 25 },
  passingMarks: { type: Number, default: 10 },
  date: { type: Date, default: Date.now },
  recurrence: { type: String, enum: ['One-off', 'Weekly', 'Bi-weekly', 'Monthly'], default: 'One-off' },
  conductedVia: { type: String, enum: ['Paper / Pen', 'Online Quiz', 'Oral / Viva', 'Lab / Practical'], default: 'Paper / Pen' },
  instructions: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Scheduled', 'Conducted', 'Evaluated', 'Published'], 
    default: 'Evaluated' 
  },
  sittings: { type: Number, default: 1 },
  entries: [studentEntrySchema],
  stats: {
    averageScore: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    lowestScore: { type: Number, default: 0 },
    passPercentage: { type: Number, default: 0 },
    totalAppeared: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Assessment', assessmentSchema);
