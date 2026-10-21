const mongoose = require('mongoose');

const studentHealthRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required'],
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown',
  },
  height: {
    type: Number, // in cm
    default: null,
  },
  weight: {
    type: Number, // in kg
    default: null,
  },
  allergies: {
    type: String,
    trim: true,
    default: 'None',
  },
  visionLeft: {
    type: String,
    trim: true,
    default: '6/6',
  },
  visionRight: {
    type: String,
    trim: true,
    default: '6/6',
  },
  dentalNotes: {
    type: String,
    trim: true,
    default: 'Normal',
  },
  checkupDate: {
    type: Date,
    default: Date.now,
  },
  doctorName: {
    type: String,
    trim: true,
    default: 'Dr. School Medical Officer',
  },
  remarks: {
    type: String,
    trim: true,
    default: 'Healthy & Fit',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('StudentHealthRecord', studentHealthRecordSchema);
