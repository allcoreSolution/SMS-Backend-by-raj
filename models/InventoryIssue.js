const mongoose = require('mongoose');

const inventoryIssueSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  issuedToMode: { type: String, enum: ['Student', 'Staff'], required: true },
  issuedToId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Ref to Student or Staff
  quantity: { type: Number, required: true },
  issueDate: { type: Date, default: Date.now },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
}, { timestamps: true });

module.exports = mongoose.model('InventoryIssue', inventoryIssueSchema);