const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');

// Analytics
router.get('/dashboard-analytics', superAdminController.getDashboardAnalytics);

// Team CRUD
router.get('/team', superAdminController.getTeamMembers);
router.post('/team', superAdminController.addTeamMember);
router.put('/team/:id', superAdminController.updateTeamMember);      // ADD
router.delete('/team/:id', superAdminController.deleteTeamMember);  // ADD

// Comms
router.get('/comms/rate-cards', superAdminController.getRateCards);
router.put('/comms/rate-cards', superAdminController.updateRateCards);

// Website
router.get('/website/templates', superAdminController.getWebsiteTemplates);

module.exports = router;
