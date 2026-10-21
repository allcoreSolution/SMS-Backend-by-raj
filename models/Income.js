const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Income name/source is required'],
    trim: true,
  },
  incomeHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IncomeHead',
    required: [true, 'Income head is required'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: [true, 'Income amount is required'],
  },
  invoiceNumber: {
    type: String,
    trim: true,
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI/Online', 'Demand Draft'],
    default: 'Cash',
  },
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount',
  },
  description: {
    type: String,
    trim: true,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Income', incomeSchema);
