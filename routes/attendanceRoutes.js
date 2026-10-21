const express = require('express');
const router = express.Router();
const { 
  markAttendance, 
  getAttendanceByClass, 
  getStudentAttendance, 
  deleteAttendance, 
  getQRScanLogs, 
  getQRAttendanceReport, 
  recordQRScan,
  getAttendanceSummary
} = require('../controllers/attendanceController');

// Define API routes
router.get('/summary', getAttendanceSummary);
router.get('/', getAttendanceByClass);
router.post('/', markAttendance);
router.post('/mark', markAttendance); // Upsert student attendance (now supports array for bulk)
router.post('/qr-scan', recordQRScan); // Record QR scan
router.get('/class-date', getAttendanceByClass); // query ?classId=&sectionId=&date= or startDate/endDate
router.get('/student/:studentId', getStudentAttendance); // query month/year or startDate/endDate
router.get('/qr-scan-logs', getQRScanLogs);
router.get('/qr-report', getQRAttendanceReport);
router.delete('/:id', deleteAttendance);

module.exports = router;
