const mongoose = require('mongoose');

const feeCollectionSchema = new mongoose.Schema({
  receiptNo: {
    type: String,
    required: true,
    unique: true,
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
  amountPaid: {
    type: Number,
    required: true,
  },
  fineAmount: {
    type: Number,
    default: 0,
  },
  discount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeDiscount',
    default: null,
  },
  paymentMode: {
    type: String,
    required: true,
    enum: ['Cash', 'Cheque', 'Online', 'DD', 'UPI', 'Card', 'NetBanking'],
  },
  referenceNo: {
    type: String,
    trim: true,
    default: '',
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('FeeCollection', feeCollectionSchema);
