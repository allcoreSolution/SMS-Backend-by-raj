const express = require('express');
const router = express.Router();
const { 
  getOnlineExamDashboardStats,
  getOnlineExams, 
  getOnlineExamById,
  createOnlineExam, 
  updateOnlineExam,
  deleteOnlineExam,
  getQuestionBank,
  createQuestion,
  updateQuestion,
  bulkUploadQuestions,
  deleteQuestion,
  getChaptersTopics,
  createChapterTopic,
  deleteChapterTopic,
  submitOnlineExam, 
  getOnlineExamResults 
} = require('../controllers/onlineExamController');

// Dashboard Stats
router.get('/dashboard-stats', getOnlineExamDashboardStats);

// Online Exams CRUD
router.get('/', getOnlineExams);
router.get('/:id', getOnlineExamById);
router.post('/', createOnlineExam);
router.put('/:id', updateOnlineExam);
router.delete('/:id', deleteOnlineExam);

// Question Bank
router.get('/questions/bank', getQuestionBank);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.post('/questions/bulk', bulkUploadQuestions);
router.delete('/questions/:id', deleteQuestion);

// Chapters & Topics
router.get('/chapters/list', getChaptersTopics);
router.post('/chapters', createChapterTopic);
router.delete('/chapters/:id', deleteChapterTopic);

// Submissions & Results
router.post('/submit', submitOnlineExam);
router.get('/results/list', getOnlineExamResults);

module.exports = router;
