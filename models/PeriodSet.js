const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  periodNumber: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  }, // e.g. "Period 1", "Morning Assembly", "Lunch Break"
  startTime: {
    type: String,
    required: true
  }, // e.g. "08:00 AM" or "08:00"
  endTime: {
    type: String,
    required: true
  }, // e.g. "08:45 AM" or "08:45"
  type: {
    type: String,
    enum: ['Teaching', 'Break', 'Assembly'],
    default: 'Teaching'
  }
});

const periodSetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  }, // e.g. "Regular Daily Schedule", "Morning Shift"
  isDefault: {
    type: Boolean,
    default: false
  },
  periods: [periodSchema],
  assignedClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicClass'
  }]
}, { timestamps: true });

module.exports = mongoose.model('PeriodSet', periodSetSchema);
