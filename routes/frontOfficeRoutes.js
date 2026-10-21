const express = require('express');
const router = express.Router();
const {
  getFrontOfficeDashboardStats,
  // Enquiries
  getEnquiries, getEnquiryById, createEnquiry, updateEnquiry, deleteEnquiry,
  // Visitors
  getVisitors, getVisitorById, addVisitor, updateVisitor, checkoutVisitor, deleteVisitor,
  // Complaints
  getComplaints, getComplaintById, addComplaint, updateComplaint, deleteComplaint,
  // Postal
  getPostalRecords, getPostalRecordById, addPostalRecord, updatePostalRecord, deletePostalRecord,
  // Gate Passes
  getGatePasses, getGatePassById, createGatePass, updateGatePass, updateGatePassStatus, deleteGatePass,
  // Campus Workers
  getCampusWorkers, getCampusWorkerById, createCampusWorker, updateCampusWorker, addCampusWorkerLog, deleteCampusWorker
} = require('../controllers/frontOfficeController');

// Dashboard Stats
router.get('/dashboard-stats', getFrontOfficeDashboardStats);

// Admission Enquiries
router.get('/enquiries', getEnquiries);
router.post('/enquiries', createEnquiry);
router.get('/enquiries/:id', getEnquiryById);
router.put('/enquiries/:id', updateEnquiry);
router.patch('/enquiries/:id', updateEnquiry);
router.delete('/enquiries/:id', deleteEnquiry);

// Visitor Book
router.get('/visitors', getVisitors);
router.post('/visitors', addVisitor);
router.get('/visitors/:id', getVisitorById);
router.put('/visitors/:id', updateVisitor);
router.put('/visitors/:id/checkout', checkoutVisitor);
router.delete('/visitors/:id', deleteVisitor);

// Complaints
router.get('/complaints', getComplaints);
router.post('/complaints', addComplaint);
router.get('/complaints/:id', getComplaintById);
router.put('/complaints/:id', updateComplaint);
router.patch('/complaints/:id', updateComplaint);
router.delete('/complaints/:id', deleteComplaint);

// Postal Records
router.get('/postal', getPostalRecords);
router.post('/postal', addPostalRecord);
router.get('/postal/:id', getPostalRecordById);
router.put('/postal/:id', updatePostalRecord);
router.delete('/postal/:id', deletePostalRecord);

// Gate Passes
router.get('/gate-passes', getGatePasses);
router.post('/gate-passes', createGatePass);
router.get('/gate-passes/:id', getGatePassById);
router.put('/gate-passes/:id', updateGatePass);
router.put('/gate-passes/:id/status', updateGatePassStatus);
router.delete('/gate-passes/:id', deleteGatePass);

// Campus Workers
router.get('/campus-workers', getCampusWorkers);
router.post('/campus-workers', createCampusWorker);
router.get('/campus-workers/:id', getCampusWorkerById);
router.put('/campus-workers/:id', updateCampusWorker);
router.post('/campus-workers/:id/logs', addCampusWorkerLog);
router.delete('/campus-workers/:id', deleteCampusWorker);

module.exports = router;
