const express = require('express');
const router = express.Router();
const cctvController = require('../controllers/cctvController');

// Stats & Overview
router.get('/stats', cctvController.getCctvStats);

// Cameras CRUD
router.get('/cameras', cctvController.getCameras);
router.get('/cameras/:id', cctvController.getCameraById);
router.post('/cameras', cctvController.createCamera);
router.put('/cameras/:id', cctvController.updateCamera);
router.delete('/cameras/:id', cctvController.deleteCamera);
router.patch('/cameras/:id/toggle', cctvController.toggleCamera);

// CCTV Access Audit Logs
router.get('/logs', cctvController.getAccessLogs);
router.post('/logs', cctvController.createAccessLog);

// Parent Viewing Policy
router.get('/policy', cctvController.getPolicy);
router.put('/policy', cctvController.updatePolicy);

module.exports = router;
