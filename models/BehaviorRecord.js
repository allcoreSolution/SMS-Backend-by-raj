const mongoose = require('mongoose');

const behaviorRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required'],
  },
  title: {
    type: String,
    required: [true, 'Title / Incident summary is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['Positive', 'Negative'],
    default: 'Positive',
  },
  points: {
    type: Number,
    default: 1,
  },
  incidentDate: {
    type: Date,
    default: Date.now,
  },
  reportedBy: {
    type: String,
    trim: true,
    default: 'Class Teacher',
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('BehaviorRecord', behaviorRecordSchema);
