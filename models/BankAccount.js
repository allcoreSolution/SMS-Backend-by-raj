const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  accountTitle: {
    type: String,
    required: [true, 'Account title is required'],
    trim: true,
  },
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true,
  },
  branchName: {
    type: String,
    trim: true,
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true,
  },
  ifscCode: {
    type: String,
    trim: true,
  },
  accountType: {
    type: String,
    enum: ['Savings', 'Current', 'Escrow', 'Cash in Hand', 'Other'],
    default: 'Current',
  },
  openingBalance: {
    type: Number,
    default: 0,
  },
  currentBalance: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('BankAccount', bankAccountSchema);
