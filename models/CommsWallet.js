const mongoose = require('mongoose');

// Transaction Sub-Schema
const walletTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return `TXN-CW-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    }
  },
  orderId: {
    type: String,
    default: function() {
      return `#order_${Math.random().toString(36).substring(2, 10)}`;
    }
  },
  type: {
    type: String,
    enum: ['Credit', 'Debit'],
    required: true
  },
  channel: {
    type: String,
    required: true,
    default: 'Top-up'
  },
  amount: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'Razorpay'
  },
  status: {
    type: String,
    enum: ['Success', 'Pending', 'Failed'],
    default: 'Success'
  },
  recipientCount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  date: {
    type: String
  }
}, { timestamps: true });

// Main Wallet Schema
const commsWalletSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: true,
    default: 'Greenwood International School'
  },
  balance: {
    type: Number,
    default: 54550.00
  },
  totalRecharged: {
    type: Number,
    default: 54550.00
  },
  spent30Days: {
    type: Number,
    default: 1420.00
  },
  messagesSent: {
    type: Number,
    default: 1890
  },
  rates: {
    whatsapp: { type: Number, default: 0.78 },
    smsTransactional: { type: Number, default: 0.22 },
    smsPromotional: { type: Number, default: 0.18 },
    voiceCall: { type: Number, default: 0.45 }
  },
  settings: {
    lowBalanceAlert: { type: Boolean, default: true },
    alertThreshold: { type: Number, default: 500 },
    alertEmail: { type: String, default: 'admin@greenwood.edu' },
    alertPhone: { type: String, default: '+91 98765 43210' },
    autoRecharge: { type: Boolean, default: false },
    autoRechargeAmount: { type: Number, default: 5000 }
  },
  transactions: [walletTransactionSchema]
}, { timestamps: true });

module.exports = mongoose.model('CommsWallet', commsWalletSchema);
