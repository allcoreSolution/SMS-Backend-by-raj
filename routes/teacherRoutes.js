const express = require('express');
const router = express.Router();
const { 
  getTeacherDashboard,
  getTeacherProfile,
  updateTeacherProfile,
  getTeacherLoans,
  applyTeacherLoan,
  getTeacherAttendance,
  getTeacherLeaves,
  getTeacherTimetable,
  saveTeacherTimetableSlot,
  deleteTeacherTimetableSlot
} = require('../controllers/teacherController');
const { applyLeave } = require('../controllers/leaveController');

// Teacher Dashboard endpoints
router.get('/dashboard', getTeacherDashboard);
router.get('/dashboard-stats', getTeacherDashboard);

// Teacher Profile endpoints with real barcode & QR code
router.get('/profile', getTeacherProfile);
router.put('/profile', updateTeacherProfile);

// Teacher Loans and Advances endpoints
router.get('/loans', getTeacherLoans);
router.post('/loans', applyTeacherLoan);

// Teacher Attendance & Leaves endpoints
router.get('/attendance', getTeacherAttendance);
router.get('/leaves', getTeacherLeaves);
router.post('/leaves', applyLeave);

// Teacher Timetable endpoints
router.get('/timetable', getTeacherTimetable);
router.post('/timetable/slot', saveTeacherTimetableSlot);
router.put('/timetable/slot/:id', saveTeacherTimetableSlot);
router.delete('/timetable/slot/:id', deleteTeacherTimetableSlot);

module.exports = router;

