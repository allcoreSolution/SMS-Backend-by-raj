const express = require('express');
const router = express.Router();
const chatModerationController = require('../controllers/chatModerationController');

// 1. Settings & Policy
router.get('/settings', chatModerationController.getSettings);
router.put('/settings', chatModerationController.updateSettings);

// 2. Metrics & Dashboard Stats
router.get('/stats', chatModerationController.getStats);

// 3. Conversations Surveillance
router.get('/conversations', chatModerationController.getConversations);
router.get('/conversations/:id', chatModerationController.getConversationById);

// 4. Moderation Actions
router.patch('/conversations/:id/lock', chatModerationController.toggleLockConversation);
router.post('/conversations/:id/messages/:messageId/redact', chatModerationController.redactMessage);
router.post('/conversations/:id/messages/:messageId/restore', chatModerationController.restoreMessage);
router.post('/conversations/:id/notes', chatModerationController.addAdminNote);

// 5. Abuse Reports Triage
router.get('/reports', chatModerationController.getReports);
router.patch('/reports/:reportId/resolve', chatModerationController.resolveReport);

module.exports = router;
