const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');

router.post('/register', tenantController.registerTenant);
router.get('/list', tenantController.getTenants);

// Newly added SuperAdmin specific routes (MUST BE ABOVE /:id)
router.get('/stats', tenantController.getDashboardStats);
router.put('/wallet/recharge', tenantController.rechargeWallet);
router.get('/tickets', tenantController.getAllTickets);

router.get('/:id', tenantController.getTenantById);
router.put('/:id', tenantController.updateTenant);
router.delete('/:id', tenantController.deleteTenant);
router.put('/:id/suspend', tenantController.suspendTenant);

module.exports = router;