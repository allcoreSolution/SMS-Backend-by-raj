const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String },
  phone: { type: String },
  address: { type: String },
  gstNumber: { type: String },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);