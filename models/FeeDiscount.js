const mongoose = require('mongoose');

const feeDiscountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Fee Discount name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Discount code is required'],
    trim: true,
    unique: true,
  },
  discountType: {
    type: String,
    required: true,
    enum: ['Percentage', 'Fixed'],
  },
  amount: {
    type: Number,
    required: [true, 'Discount amount is required'],
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('FeeDiscount', feeDiscountSchema);
