const express = require('express');
const router = express.Router();
const {
  getSurveys,
  getSurveyStats,
  getTemplates,
  getSurveyById,
  createSurvey,
  updateSurvey,
  updateSurveyStatus,
  duplicateSurvey,
  deleteSurvey,
  submitResponse,
  getSurveyResponses,
  getFeedbacks,
  createFeedback,
  updateFeedback,
  deleteFeedback
} = require('../controllers/surveyController');

// Feedback Triage endpoints (must precede /:id)
router.get('/feedbacks', getFeedbacks);
router.post('/feedbacks', createFeedback);
router.patch('/feedbacks/:id', updateFeedback);
router.delete('/feedbacks/:id', deleteFeedback);

// Global Stats & Templates (must precede /:id)
router.get('/stats', getSurveyStats);
router.get('/templates', getTemplates);

// Response Submission & Analytics
router.post('/submit', submitResponse);
router.post('/:id/responses', submitResponse);
router.get('/:id/responses', getSurveyResponses);

// Actions on survey
router.post('/:id/duplicate', duplicateSurvey);
router.patch('/:id/status', updateSurveyStatus);

// Survey Base CRUD
router.get('/', getSurveys);
router.post('/', createSurvey);
router.get('/:id', getSurveyById);
router.put('/:id', updateSurvey);
router.delete('/:id', deleteSurvey);

module.exports = router;

