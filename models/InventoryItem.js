const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  totalStock: { type: Number, default: 0 },
  unitPrice: { type: Number },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);