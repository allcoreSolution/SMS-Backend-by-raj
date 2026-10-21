const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  eventType: {
    type: String,
    enum: ['Event', 'Holiday', 'Seminar', 'Exam', 'Meeting'],
    default: 'Event'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  audience: {
    type: String,
    default: 'All (Entire School)'
  },
  location: {
    type: String,
    default: 'School Campus'
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed'],
    default: 'Upcoming'
  },
  organizer: {
    type: String,
    default: 'School Administration'
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
