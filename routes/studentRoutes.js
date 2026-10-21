const express = require('express');
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudentDashboardStats,
  getStudentById,
  updateStudent,
  updateStudentPhoto,
  deleteStudent
} = require('../controllers/studentController');
const { protect, checkPermission, checkStudentOrAdmin } = require('../middleware/authMiddleware');
const { uploadStudentAdmissionFiles } = require('../middleware/uploadMiddleware');

// Dashboard stats route (accessible to authenticated users)
router.get('/dashboard/stats', getStudentDashboardStats);

router.route('/')
  .post(uploadStudentAdmissionFiles, createStudent)
  .get(getStudents);

router.post('/:id/photo', uploadStudentAdmissionFiles, updateStudentPhoto);

router.route('/:id')
  .get(getStudentById)
  .put(uploadStudentAdmissionFiles, updateStudent)
  .patch(uploadStudentAdmissionFiles, updateStudent)
  .delete(deleteStudent);

module.exports = router;
