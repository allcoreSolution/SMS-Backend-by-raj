const express = require('express');
const router = express.Router();
const {
  getStrands,
  createStrand,
  updateStrand,
  deleteStrand,
  getAssessments,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getCbcStats
} = require('../controllers/cbcController');

// Stats
router.get('/stats', getCbcStats);

// Strands
router.get('/strands', getStrands);
router.post('/strands', createStrand);
router.put('/strands/:id', updateStrand);
router.delete('/strands/:id', deleteStrand);

// Assessments
router.get('/assessments', getAssessments);
router.post('/assessments', createAssessment);
router.put('/assessments/:id', updateAssessment);
router.patch('/assessments/:id', updateAssessment);
router.delete('/assessments/:id', deleteAssessment);

module.exports = router;
