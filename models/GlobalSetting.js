const mongoose = require('mongoose');

const globalSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Can store objects, arrays, strings, etc.
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('GlobalSetting', globalSettingSchema);
