const express = require('express');
const router = express.Router();
const {
  getAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  saveMarks,
  publishAssessment,
  getAssessmentStats,
  getStudentReport,
  getRankList
} = require('../controllers/assessmentController');

// Summary & Aggregates
router.get('/stats/summary', getAssessmentStats);
router.get('/student-report', getStudentReport);
router.get('/rank-list', getRankList);

// Standard CRUD
router.get('/', getAssessments);
router.get('/:id', getAssessmentById);
router.post('/', createAssessment);
router.put('/:id', updateAssessment);
router.delete('/:id', deleteAssessment);

// Marks and Publishing
router.post('/:id/marks', saveMarks);
router.post('/:id/publish', publishAssessment);

module.exports = router;
