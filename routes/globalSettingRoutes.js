const express = require('express');
const router = express.Router();
const globalSettingController = require('../controllers/globalSettingController');
const { upload } = require('../middleware/uploadMiddleware');

// General settings list & utilities
router.get('/', globalSettingController.getAllSettings);
router.post('/upload', upload.single('file'), globalSettingController.uploadFile);
router.post('/test-smtp', globalSettingController.testSmtp);

// Subscription & Billing Routes
router.get('/subscription/current', globalSettingController.getCurrentSubscription);
router.get('/subscription/plans', globalSettingController.getSubscriptionPlans);
router.post('/subscription/upgrade', globalSettingController.upgradeSubscription);
router.get('/subscription/history', globalSettingController.getSubscriptionHistory);

// Audit Trail Routes
router.get('/audit-trail/list', globalSettingController.getAuditTrail);

// Dynamic Key-based Settings (Profile, Gateways, System Prefixes, Notifications)
router.get('/:key', globalSettingController.getSetting);
router.put('/:key', globalSettingController.saveSetting);

module.exports = router;
