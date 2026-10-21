const mongoose = require('mongoose');

const feeDataAuditSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true, // e.g. CREATE, UPDATE, DELETE
    enum: ['CREATE', 'UPDATE', 'DELETE', 'COLLECT_FEE', 'ASSIGN_FEE']
  },
  modelName: {
    type: String,
    required: true, // e.g. FeeType, FeeGroup, FeeDiscount, AssignFee, FeeCollection
  },
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Stores changes or payload details
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FeeDataAudit', feeDataAuditSchema);
