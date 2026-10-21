const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number },
  status: { type: String, enum: ['Paid', 'Pending', 'Processing'], default: 'Pending' },
  paymentDate: { type: Date }
}, { timestamps: true });

// Pre-save hook to calculate net salary automatically
payrollSchema.pre('save', function(next) {
  this.netSalary = this.basicSalary + this.allowances - this.deductions;
  next();
});

module.exports = mongoose.model('Payroll', payrollSchema);
