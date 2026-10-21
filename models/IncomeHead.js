const mongoose = require('mongoose');

const incomeHeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Income head name is required'],
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

module.exports = mongoose.model('IncomeHead', incomeHeadSchema);
