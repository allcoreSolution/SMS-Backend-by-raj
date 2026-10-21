const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  permissions: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Role', roleSchema);
