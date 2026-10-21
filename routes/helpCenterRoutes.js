const express = require('express');
const router = express.Router();
const {
  getHelpCenterStats,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getArticles,
  getArticleByIdOrSlug,
  createArticle,
  updateArticle,
  deleteArticle,
  voteArticle,
  chatWithAi,
  getAiConversations,
  clearAiConversation
} = require('../controllers/helpCenterController');

// 1. Stats
router.get('/stats', getHelpCenterStats);

// 2. Categories CRUD
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// 3. Articles CRUD
router.get('/articles', getArticles);
router.get('/articles/:id', getArticleByIdOrSlug);
router.post('/articles', createArticle);
router.put('/articles/:id', updateArticle);
router.delete('/articles/:id', deleteArticle);
router.post('/articles/:id/vote', voteArticle);

// 4. AI Chatbot
router.post('/chat', chatWithAi);
router.get('/chat/conversations', getAiConversations);
router.delete('/chat/conversations/:id', clearAiConversation);

module.exports = router;
