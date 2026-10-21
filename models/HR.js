const mongoose = require('mongoose');

// ======================== DEPARTMENT SCHEMA ========================
const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, trim: true, default: '' },
  headOfDepartment: { type: String, default: '' },
  description: { type: String, default: '' },
  staffCount: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

// ======================== DESIGNATION SCHEMA ========================
const designationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, trim: true, default: '' },
  department: { type: String, default: 'General' },
  description: { type: String, default: '' },
  staffCount: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

// ======================== LEAVE TYPE SCHEMA ========================
const leaveTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, trim: true, default: '' },
  daysAllowed: { type: Number, default: 12 },
  isPaid: { type: Boolean, default: true },
  applicableFor: { type: String, enum: ['All', 'Teaching', 'Non-Teaching'], default: 'All' },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

// ======================== STAFF LOAN SCHEMA ========================
const staffLoanSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  staffName: { type: String, required: true },
  employeeCode: { type: String, default: '' },
  amount: { type: Number, required: true },
  interestRate: { type: Number, default: 0 },
  repaymentMonths: { type: Number, default: 12 },
  monthlyDeduction: { type: Number, default: 0 },
  totalRepaid: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  purpose: { type: String, default: 'Personal Emergency' },
  type: { 
    type: String, 
    enum: ['Loan', 'Advance Salary', 'Advance'], 
    default: 'Loan' 
  },
  reason: { type: String, default: '' },
  repaymentSchedule: [{
    installmentNumber: { type: Number },
    month: { type: String },
    dueDate: { type: String },
    emi: { type: Number },
    status: { type: String, enum: ['Paid', 'Pending', 'Upcoming', 'Cancelled'], default: 'Pending' }
  }],
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Active', 'Closed', 'Rejected'], 
    default: 'Pending' 
  },
  disbursementDate: { type: Date },
  approvedBy: { type: String, default: 'Principal' }
}, { timestamps: true });

// ======================== SALARY TEMPLATE SCHEMA ========================
const salaryTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  basicSalary: { type: Number, required: true },
  allowances: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  deductions: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  grossSalary: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  description: { type: String, default: '' }
}, { timestamps: true });

// ======================== STAFF SALARY CONFIG SCHEMA ========================
const staffSalarySchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  staffName: { type: String, default: '' },
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryTemplate' },
  templateName: { type: String, default: 'Standard Teaching Faculty' },
  basicSalary: { type: Number, default: 35000 },
  allowances: [{ name: String, amount: Number }],
  deductions: [{ name: String, amount: Number }],
  netSalary: { type: Number, default: 35000 },
  paymentMode: { type: String, enum: ['Bank Transfer', 'Cheque', 'Cash'], default: 'Bank Transfer' },
  bankName: { type: String, default: 'State Bank of India' },
  accountNumber: { type: String, default: '' },
  ifscCode: { type: String, default: '' }
}, { timestamps: true });

// ======================== APPRAISAL MODELS ========================
const appraisalCycleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  session: { type: String, default: '2026-2027' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
  status: { type: String, enum: ['Active', 'Upcoming', 'Completed'], default: 'Active' },
  description: { type: String, default: '' }
}, { timestamps: true });

const appraisalCriterionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Teaching Methodology' },
  maxScore: { type: Number, default: 10 },
  weightage: { type: Number, default: 20 },
  description: { type: String, default: '' }
}, { timestamps: true });

const staffAppraisalSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  staffName: { type: String, required: true },
  designation: { type: String, default: 'Teacher' },
  department: { type: String, default: 'Academics' },
  cycle: { type: mongoose.Schema.Types.ObjectId, ref: 'AppraisalCycle' },
  cycleTitle: { type: String, default: 'Annual Appraisal 2026' },
  overallRating: { type: Number, default: 4.5 },
  performanceScore: { type: Number, default: 88 },
  strengths: { type: String, default: 'Excellent class discipline and syllabus coverage' },
  areasForImprovement: { type: String, default: 'Encourage more interactive lab experiments' },
  evaluator: { type: String, default: 'Principal' },
  status: { type: String, enum: ['Draft', 'Submitted', 'Reviewed', 'Approved'], default: 'Approved' }
}, { timestamps: true });

// ======================== STAFF ATTENDANCE SCHEMA ========================
const staffAttendanceSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  staffName: { type: String, required: true },
  employeeCode: { type: String, default: '' },
  date: { type: Date, required: true },
  day: { type: String },
  checkIn: { type: String, default: '08:15 AM' },
  checkOut: { type: String, default: '03:30 PM' },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half Day', 'On Leave'], default: 'Present' },
  remarks: { type: String, default: 'Regular Shift' }
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);
const Designation = mongoose.model('Designation', designationSchema);
const LeaveType = mongoose.model('LeaveType', leaveTypeSchema);
const StaffLoan = mongoose.model('StaffLoan', staffLoanSchema);
const SalaryTemplate = mongoose.model('SalaryTemplate', salaryTemplateSchema);
const StaffSalary = mongoose.model('StaffSalary', staffSalarySchema);
const AppraisalCycle = mongoose.model('AppraisalCycle', appraisalCycleSchema);
const AppraisalCriterion = mongoose.model('AppraisalCriterion', appraisalCriterionSchema);
const StaffAppraisal = mongoose.model('StaffAppraisal', staffAppraisalSchema);
const StaffAttendance = mongoose.model('StaffAttendance', staffAttendanceSchema);

module.exports = {
  Department,
  Designation,
  LeaveType,
  StaffLoan,
  SalaryTemplate,
  StaffSalary,
  AppraisalCycle,
  AppraisalCriterion,
  StaffAppraisal,
  StaffAttendance
};

