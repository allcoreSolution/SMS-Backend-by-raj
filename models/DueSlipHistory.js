const mongoose = require('mongoose');

const dueSlipHistorySchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentsCount: {
    type: Number,
    required: true
  },
  totalDueAmount: {
    type: Number,
    required: true
  },
  targetClass: {
    type: String,
    default: 'All'
  },
  targetSection: {
    type: String,
    default: 'All'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DueSlipHistory', dueSlipHistorySchema);
