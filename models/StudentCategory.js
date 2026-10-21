const mongoose = require('mongoose');

const studentCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
  },
  code: {
    type: String,
    trim: true,
    default: '',
  },
  description: {
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

module.exports = mongoose.model('StudentCategory', studentCategorySchema);
