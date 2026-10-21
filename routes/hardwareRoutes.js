const express = require('express');
const router = express.Router();
const { 
  registerDevice, 
  getDevices, 
  updateDevice, 
  deleteDevice, 
  syncPunchLog,
  pingDevice,
  syncDevice
} = require('../controllers/hardwareController');

router.post('/register', registerDevice);
router.get('/', getDevices);
router.put('/:id', updateDevice);
router.delete('/:id', deleteDevice);
router.post('/:id/ping', pingDevice);
router.post('/:id/sync', syncDevice);
router.post('/sync-punch', syncPunchLog); // Biometric machines webhook

module.exports = router;
