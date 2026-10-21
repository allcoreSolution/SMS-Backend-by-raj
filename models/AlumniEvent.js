const mongoose = require('mongoose');

const alumniEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' }],
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
}, { timestamps: true });

module.exports = mongoose.model('AlumniEvent', alumniEventSchema);