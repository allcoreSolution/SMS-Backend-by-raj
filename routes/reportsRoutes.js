const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

// Reports Hub Analytics & Filters
router.get('/overview', reportsController.getReportsOverview);
router.get('/filters', reportsController.getFilters);

// Category Domain Reports
router.get('/students', reportsController.getStudentReport);
router.get('/finance', reportsController.getFinanceReport);
router.get('/attendance', reportsController.getAttendanceReport);
router.get('/academics', reportsController.getAcademicReport);
router.get('/staff', reportsController.getStaffReport);

module.exports = router;
