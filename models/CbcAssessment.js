const mongoose = require('mongoose');

const studentScoreSchema = new mongoose.Schema({
  studentId: { type: String },
  studentName: { type: String, required: true },
  rollNo: { type: String },
  rating: { type: Number, min: 1, max: 4, default: 3 }, // 4=EE, 3=ME, 2=AE, 1=BE
  remarks: { type: String, default: '' }
});

const cbcAssessmentSchema = new mongoose.Schema({
  assessmentName: { type: String, required: true },
  subject: { type: String, required: true },
  classGrade: { type: String, required: true },
  section: { type: String, default: 'A' },
  taskType: { type: String, enum: ['Written', 'Practical', 'Observation', 'Project', 'Portfolio'], default: 'Practical' },
  strand: { type: String },
  subStrand: { type: String },
  date: { type: Date, default: Date.now },
  maxRating: { type: Number, default: 4 },
  scores: [studentScoreSchema]
}, { timestamps: true });

module.exports = mongoose.model('CbcAssessment', cbcAssessmentSchema);
