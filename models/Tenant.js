const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  schoolName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subdomain: { type: String, sparse: true },
  plan: { type: String, default: 'Trial' },
  status: { type: String, enum: ['Active', 'Inactive', 'Suspended', 'Pending'], default: 'Active' },
  validUntil: { type: Date },
  
  // Wallet / Quota for API usage
  smsQuota: { type: Number, default: 0 },
  whatsappQuota: { type: Number, default: 0 },
  emailQuota: { type: Number, default: 1000 },
  storageLimitMB: { type: Number, default: 1024 }, // 1 GB free
  
  // Customization
  logoUrl: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  adminName: { type: String },
  studentsCount: { type: Number, default: 0 } // Cache count
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);