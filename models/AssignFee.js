const mongoose = require('mongoose');

const assignFeeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  feeGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeGroup',
    required: true,
  },
  assignedDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
  },
  customAmount: {
    type: Number,
    default: null, // If null, the total of FeeGroup's FeeTypes is used
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('AssignFee', assignFeeSchema);
