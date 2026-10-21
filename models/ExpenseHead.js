const mongoose = require('mongoose');

const expenseHeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Expense head name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('ExpenseHead', expenseHeadSchema);
