const mongoose = require('mongoose');

const studentExitSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required'],
  },
  tcNo: {
    type: String,
    required: [true, 'TC Number is required'],
    trim: true,
  },
  standing: {
    type: String,
    enum: ['Pending Exit', 'TC Register', 'Exited', 'On Hold'],
    default: 'TC Register',
  },
  leftOn: {
    type: Date,
    default: Date.now,
  },
  lastClass: {
    type: String,
    trim: true,
    default: '',
  },
  duesCleared: {
    type: Boolean,
    default: true,
  },
  reason: {
    type: String,
    trim: true,
    default: 'Parent Relocation / Higher Studies',
  },
  characterConduct: {
    type: String,
    trim: true,
    default: 'Good',
  },
  recordedBy: {
    type: String,
    trim: true,
    default: 'School Admin',
  },
  remarks: {
    type: String,
    trim: true,
    default: '',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('StudentExit', studentExitSchema);
