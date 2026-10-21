const mongoose = require('mongoose');

const saasPlanSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Basic", "Premium"
  description: { type: String },
  monthlyPrice: { type: Number, required: true },
  yearlyPrice: { type: Number, required: true },
  maxStudents: { type: Number, default: 500 },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('SaaSPlan', saasPlanSchema);
