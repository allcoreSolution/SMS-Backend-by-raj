const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  branchName: { type: String, required: true },
  branchCode: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  contactEmail: { type: String },
  contactPhone: { type: String },
  principalName: { type: String },
  subscriptionPlan: { type: String, enum: ['Basic', 'Pro', 'Enterprise'], default: 'Basic' },
  status: { type: String, enum: ['Active', 'Suspended', 'Inactive', 'Pending'], default: 'Active' },
  students: { type: Number, default: 500 },
  staff: { type: Number, default: 35 },
  attendance: { type: String, default: '95%' },
  collected: { type: String, default: '₹5,50,000' },
  establishedDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);
