const express = require('express');
const router = express.Router();
const {
  chatWithAI,
  getKnowledgeBase,
  getSessions,
  clearSession
} = require('../controllers/aiController');

router.post('/chat', chatWithAI);
router.get('/knowledge', getKnowledgeBase);
router.get('/sessions', getSessions);
router.delete('/sessions/:id', clearSession);

module.exports = router;
