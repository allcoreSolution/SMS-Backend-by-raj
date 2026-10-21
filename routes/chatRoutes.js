// routes/chatRoutes.js
const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chatController');
const {
  protect,
  checkPermission
} = require('../middleware/authMiddleware');

// Public Meta webhook endpoints.
// Meta verifies the token inside verifyWhatsAppWebhook.
router.get('/whatsapp/webhook', chatController.verifyWhatsAppWebhook);
router.post('/whatsapp/webhook', chatController.handleWhatsAppWebhook);

// All routes below require a valid login token.
router.use(protect);

// Threads
router.get('/threads', chatController.getThreads);
router.post('/threads', chatController.createThread);
router.patch('/threads/:threadId/pin', chatController.togglePinThread);
router.delete('/threads/:threadId', chatController.deleteThread);
router.delete('/threads/:threadId/clear', chatController.clearThreadHistory);

// Messages
router.get('/threads/:threadId/messages', chatController.getThreadMessages);
router.post('/threads/:threadId/messages', chatController.postThreadMessage);
router.delete(
  '/threads/:threadId/messages/:messageId',
  chatController.deleteThreadMessage
);

// Contacts
router.get('/contacts', chatController.getContacts);
router.post('/contacts', chatController.addContact);
router.delete('/contacts/:id', chatController.deleteContact);

// Calls
router.post('/calls/start', chatController.startCall);
router.patch('/calls/:callId/end', chatController.endCall);
router.get('/calls/history', chatController.getCallHistory);

// Accounts and WhatsApp administration
router.post(
  '/create-account',
  checkPermission('manage_roles'),
  chatController.createAccountAndInvite
);
router.post(
  '/whatsapp/send',
  checkPermission('send_whatsapp'),
  chatController.sendWhatsAppNotification
);
router.get(
  '/whatsapp/status',
  checkPermission('manage_whatsapp'),
  chatController.getWhatsAppStatus
);
router.get(
  '/whatsapp/session',
  checkPermission('manage_whatsapp'),
  chatController.getAdminWhatsAppSession
);
router.post(
  '/whatsapp/connect',
  checkPermission('manage_whatsapp'),
  chatController.connectAdminWhatsApp
);
router.post(
  '/whatsapp/disconnect',
  checkPermission('manage_whatsapp'),
  chatController.disconnectAdminWhatsApp
);
router.post('/direct-chat', chatController.startDirectChatByNumber);

// Twilio SMS endpoints
router.post('/sms/send', chatController.sendSMS);
router.get('/sms/status', chatController.getSMSStatus);

// Dangerous operation: keep it admin/permission restricted.
router.delete(
  '/clear-all',
  checkPermission('manage_roles'),
  chatController.clearAllChats
);

module.exports = router;
