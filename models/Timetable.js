const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicClass',
    required: false
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicSection',
    required: false
  },
  className: {
    type: String,
    trim: true,
    default: ''
  },
  sectionName: {
    type: String,
    trim: true,
    default: ''
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true
  },
  periodNumber: {
    type: Number,
    required: true
  },
  periodName: {
    type: String,
    default: ''
  },
  startTime: {
    type: String,
    default: ''
  },
  endTime: {
    type: String,
    default: ''
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicSubject'
  },
  subjectName: {
    type: String,
    trim: true,
    default: ''
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  roomNumber: {
    type: String,
    default: 'Room 101'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

timetableSchema.index({ classId: 1, sectionId: 1, day: 1, periodNumber: 1 }, { sparse: true });
timetableSchema.index({ teacherId: 1, day: 1, periodNumber: 1 }, { sparse: true });

module.exports = mongoose.model('Timetable', timetableSchema);
