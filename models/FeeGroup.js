const mongoose = require('mongoose');

const feeGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Fee Group name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  feeTypes: [{
    feeType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeType',
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required for fee type in group']
    },
    fineType: {
      type: String,
      enum: ['Fixed', 'Percentage', 'None'],
      default: 'None'
    },
    fineAmount: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('FeeGroup', feeGroupSchema);
