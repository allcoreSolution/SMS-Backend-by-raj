const mongoose = require('mongoose');

const classTeacherSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicClass',
    required: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicSection',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  academicSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicSession'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

classTeacherSchema.index({ classId: 1, sectionId: 1 }, { unique: true });

module.exports = mongoose.model('ClassTeacher', classTeacherSchema);
