const express = require('express');
const router = express.Router();
const {
  getHRDashboardStats,
  // Departments
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  // Designations
  getDesignations, createDesignation, updateDesignation, deleteDesignation,
  // Leave Types
  getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType,
  // Leaves
  getLeaves, applyLeave, approveLeave, rejectLeave,
  // Salary Templates
  getSalaryTemplates, createSalaryTemplate, updateSalaryTemplate, deleteSalaryTemplate,
  // Staff Salary
  getStaffSalary, setStaffSalary,
  // Loans
  getStaffLoans, createStaffLoan, updateLoanStatus, deleteStaffLoan,
  // Appraisals
  getAppraisalCycles, createAppraisalCycle,
  getAppraisalCriteria, createAppraisalCriterion,
  getAppraisals, createAppraisal
} = require('../controllers/hrController');

// Dashboard Stats
router.get('/dashboard-stats', getHRDashboardStats);

// Departments
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

// Designations
router.get('/designations', getDesignations);
router.post('/designations', createDesignation);
router.put('/designations/:id', updateDesignation);
router.delete('/designations/:id', deleteDesignation);

// Leave Types
router.get('/leave-types', getLeaveTypes);
router.get('/leaves/types', getLeaveTypes);
router.post('/leave-types', createLeaveType);
router.post('/leaves/types', createLeaveType);
router.put('/leave-types/:id', updateLeaveType);
router.delete('/leave-types/:id', deleteLeaveType);
router.delete('/leaves/types/:id', deleteLeaveType);

// Leaves
router.get('/leaves', getLeaves);
router.post('/leaves', applyLeave);
router.patch('/leaves/:id/approve', approveLeave);
router.put('/leaves/:id/approve', approveLeave);
router.patch('/leaves/:id/reject', rejectLeave);
router.put('/leaves/:id/reject', rejectLeave);
router.patch('/leaves/:id/status', approveLeave);

// Salary Templates
router.get('/salary-templates', getSalaryTemplates);
router.post('/salary-templates', createSalaryTemplate);
router.put('/salary-templates/:id', updateSalaryTemplate);
router.delete('/salary-templates/:id', deleteSalaryTemplate);

// Staff Salary Config
router.get('/salary/staff/:staffId', getStaffSalary);
router.post('/salary/staff/:staffId', setStaffSalary);

// Staff Loans
router.get('/loans', getStaffLoans);
router.post('/loans', createStaffLoan);
router.patch('/loans/:id/status', updateLoanStatus);
router.put('/loans/:id/status', updateLoanStatus);
router.delete('/loans/:id', deleteStaffLoan);

// Appraisals
router.get('/appraisals/cycles', getAppraisalCycles);
router.post('/appraisals/cycles', createAppraisalCycle);
router.get('/appraisals/criteria', getAppraisalCriteria);
router.post('/appraisals/criteria', createAppraisalCriterion);
router.get('/appraisals/list', getAppraisals);
router.post('/appraisals/list', createAppraisal);

module.exports = router;
