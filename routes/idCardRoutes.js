const express = require('express');
const router = express.Router();
const {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  autoGenerateIdCard,
  bulkAutoGenerate,
  getGeneratedCards,
  markCardPrinted,
  deleteGeneratedCard,
  getIdCardStats
} = require('../controllers/idCardController');

// Template routes
router.get('/templates', getTemplates);
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.delete('/templates/:id', deleteTemplate);

// Auto-generation routes
router.post('/generate', autoGenerateIdCard);
router.post('/bulk-generate', bulkAutoGenerate);

// Issued cards archive routes
router.get('/issued', getGeneratedCards);
router.put('/issued/:id/print', markCardPrinted);
router.delete('/issued/:id', deleteGeneratedCard);

// Dashboard statistics
router.get('/stats', getIdCardStats);

module.exports = router;
