const mongoose = require('mongoose');

// 1. Registered App / Tool Metadata Schema
const appRegistrySchema = new mongoose.Schema({
  appId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Academic', 'Insights', 'Utility', 'Analytics', 'Communication'],
    default: 'Utility'
  },
  icon: {
    type: String,
    default: 'Grid'
  },
  iconBg: {
    type: String,
    default: 'bg-indigo-600'
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  launchCount: {
    type: Number,
    default: 0
  },
  lastLaunchedAt: {
    type: Date,
    default: Date.now
  },
  badge: {
    text: { type: String, default: null },
    color: { type: String, default: null }
  },
  version: {
    type: String,
    default: '2.4.0'
  }
}, { timestamps: true });

// 2. Saved Question Papers
const questionPaperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  durationMinutes: { type: Number, default: 180 },
  totalMarks: { type: Number, default: 100 },
  academicSession: { type: String, default: '2026-2027' },
  generalInstructions: {
    type: [String],
    default: [
      'Read all questions carefully before attempting.',
      'All sections are compulsory unless internal choice is specified.',
      'Write legibly and maintain neat diagrammatic presentations.'
    ]
  },
  sections: [
    {
      name: { type: String, default: 'Section A' },
      description: { type: String, default: 'Objective & Multiple Choice Questions' },
      questions: [
        {
          questionText: { type: String, required: true },
          type: { type: String, default: 'MCQ' },
          marks: { type: Number, default: 1 },
          options: [String]
        }
      ]
    }
  ],
  createdBy: { type: String, default: 'Academic Department' }
}, { timestamps: true });

// 3. Saved Exam Seating Arrangement Plans
const seatingPlanSchema = new mongoose.Schema({
  examTitle: { type: String, required: true },
  examDate: { type: Date, default: Date.now },
  classesIncluded: { type: [String], default: [] },
  totalStudentsAllocated: { type: Number, default: 0 },
  rooms: [
    {
      roomName: { type: String, required: true },
      capacity: { type: Number, default: 30 },
      totalAllocated: { type: Number, default: 0 },
      benches: [
        {
          benchNo: Number,
          row: Number,
          col: Number,
          studentName: String,
          admissionNo: String,
          rollNo: String,
          className: String,
          gender: String
        }
      ]
    }
  ]
}, { timestamps: true });

// 4. Whiteboard Saved Canvas
const whiteboardSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled Board' },
  teacherName: { type: String, default: 'Class Teacher' },
  subject: { type: String, default: 'General' },
  canvasDataUrl: { type: String, default: '' },
  elementsCount: { type: Number, default: 0 }
}, { timestamps: true });

const AppRegistry = mongoose.model('AppRegistry', appRegistrySchema);
const QuestionPaper = mongoose.model('QuestionPaper', questionPaperSchema);
const SeatingPlan = mongoose.model('SeatingPlan', seatingPlanSchema);
const Whiteboard = mongoose.model('Whiteboard', whiteboardSchema);

module.exports = {
  AppRegistry,
  QuestionPaper,
  SeatingPlan,
  Whiteboard
};
