const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  name: { 
    type: String, 
    trim: true,
  },
  title: { 
    type: String, 
    trim: true,
  },
  expenseHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExpenseHead',
  },
  amount: { 
    type: Number, 
    required: [true, 'Expense amount is required'], 
  },
  category: { 
    type: String, 
    default: 'General Expense',
  },
  date: { 
    type: Date, 
    default: Date.now, 
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
  },
  receiptUrl: { 
    type: String, 
  }
}, { 
  timestamps: true, 
});

module.exports = mongoose.model('Expense', expenseSchema);
