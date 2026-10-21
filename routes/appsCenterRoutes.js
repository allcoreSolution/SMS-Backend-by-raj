const express = require('express');
const router = express.Router();
const {
  getApps,
  launchApp,
  toggleAppStatus,
  getStudent360,
  generateSeatingPlan,
  getSeatingPlans,
  exportModuleData,
  getFinancialAnalytics,
  saveQuestionPaper,
  getQuestionPapers,
  saveWhiteboard,
  getWhiteboards
} = require('../controllers/appsCenterController');

// 1. Apps Registry
router.get('/', getApps);
router.post('/launch/:appId', launchApp);
router.patch('/toggle/:appId', toggleAppStatus);

// 2. Student 360 View
router.get('/student-360/:studentId', getStudent360);

// 3. Exam Seating Generator
router.post('/seating/generate', generateSeatingPlan);
router.get('/seating', getSeatingPlans);

// 4. Data Export Hub
router.post('/export', exportModuleData);

// 5. Financial Analytics
router.get('/financial-analytics', getFinancialAnalytics);

// 6. Question Paper Generator
router.post('/question-papers', saveQuestionPaper);
router.get('/question-papers', getQuestionPapers);

// 7. Digital Whiteboard
router.post('/whiteboards', saveWhiteboard);
router.get('/whiteboards', getWhiteboards);

module.exports = router;
