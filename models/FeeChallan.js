const mongoose = require('mongoose');

const feeChallanSchema = new mongoose.Schema({
  challanNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
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
  amount: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Issued', 'Paid', 'Expired'],
    default: 'Issued',
  },
  paymentDate: {
    type: Date,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('FeeChallan', feeChallanSchema);
