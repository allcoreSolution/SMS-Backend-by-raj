const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  passoutYear: { type: Number, required: true },
  profession: { type: String },
  currentCompany: { type: String },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
}, { timestamps: true });

module.exports = mongoose.model('Alumni', alumniSchema);