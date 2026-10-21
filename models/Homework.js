const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  submissionText: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  status: { type: String, enum: ['Submitted', 'Evaluated', 'Pending', 'Late'], default: 'Submitted' },
  evaluatedMarks: { type: Number },
  teacherRemarks: { type: String, default: '' },
  evaluatedAt: { type: Date }
}, { _id: true });

const homeworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  academicClass: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass', required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSection', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSubject', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  assignDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  maxMarks: { type: Number, default: 20 },
  fileUrl: { type: String }, // Optional attachment
  fileName: { type: String, default: 'Assignment_Worksheet.pdf' },
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
  submissions: [submissionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Homework', homeworkSchema);
