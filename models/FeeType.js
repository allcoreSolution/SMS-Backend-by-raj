const mongoose = require('mongoose');

const feeTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Fee Type name is required'],
    trim: true,
  },
  code: {
    type: String,
    trim: true,
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

module.exports = mongoose.model('FeeType', feeTypeSchema);
