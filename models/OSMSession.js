const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  qNo: { type: String, required: true },
  label: { type: String, default: '' },
  maxMarks: { type: Number, required: true, default: 5 },
  compulsory: { type: Boolean, default: true },
  text: { type: String, default: '' },
  rubric: { type: String, default: '' }
}, { _id: false });

const sheetSchema = new mongoose.Schema({
  id: { type: String, required: true },
  studentId: { type: String, default: '' },
  studentName: { type: String, required: true },
  rollNo: { type: String, default: '' },
  anonymousCode: { type: String, default: '' },
  fileName: { type: String, default: 'answersheet.pdf' },
  pages: { type: Number, default: 3 },
  status: { 
    type: String, 
    enum: ['Pending', 'In-Progress', 'Evaluated', 'Moderated'], 
    default: 'Pending' 
  },
  marks: [{
    qNo: { type: String },
    awardedMarks: { type: Number, default: 0 },
    comments: { type: String, default: '' }
  }],
  totalAwarded: { type: Number, default: 0 },
  annotations: [{
    page: { type: Number, default: 1 },
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 },
    type: { type: String, default: 'tick' }, // tick, cross, partial, comment
    comment: { type: String, default: '' }
  }],
  flaggedForModeration: { type: Boolean, default: false },
  moderatorMarks: { type: Number, default: null },
  moderationNotes: { type: String, default: '' },
  evaluatedAt: { type: Date, default: null }
}, { _id: false });

const osmSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide session title'],
    trim: true
  },
  className: {
    type: String,
    required: [true, 'Please provide class name'],
    default: 'Class 10'
  },
  section: {
    type: String,
    default: 'A'
  },
  subjectName: {
    type: String,
    required: [true, 'Please provide subject name'],
    default: 'Mathematics'
  },
  examType: {
    type: String,
    default: 'Term 1 Exam'
  },
  totalMarks: {
    type: Number,
    default: 50
  },
  status: {
    type: String,
    enum: ['Draft', 'Evaluating', 'Moderation', 'Completed'],
    default: 'Draft'
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  allowAnnotations: {
    type: Boolean,
    default: true
  },
  moderationEnabled: {
    type: Boolean,
    default: true
  },
  deadline: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  evaluatorName: {
    type: String,
    default: 'Senior Subject Evaluator'
  },
  questions: [questionSchema],
  sheets: [sheetSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

osmSessionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (this.questions && this.questions.length > 0) {
    this.totalMarks = this.questions.reduce((sum, q) => sum + (Number(q.maxMarks) || 0), 0);
  }
  if (typeof next === 'function') next();
});

module.exports = mongoose.model('OSMSession', osmSessionSchema);
