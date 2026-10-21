const mongoose = require('mongoose');

const studentHouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'House name is required'],
    unique: true,
    trim: true,
  },
  color: {
    type: String,
    default: '#3b82f6',
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  headStudent: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('StudentHouse', studentHouseSchema);
