const mongoose = require('mongoose');

const academicSessionSchema = new mongoose.Schema({
  name: {
    type: String, // e.g. "2026-2027", "2025-2026"
    required: true,
    unique: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Current', 'Archived', 'Upcoming'],
    default: 'Active'
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('AcademicSession', academicSessionSchema);
