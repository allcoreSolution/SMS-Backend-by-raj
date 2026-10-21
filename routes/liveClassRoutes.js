const express = require('express');
const router = express.Router();
const {
  getLiveClasses,
  getLiveClassStats,
  scheduleLiveClass,
  getLiveClassById,
  updateLiveClass,
  deleteLiveClass,
  updateLiveClassStatus,
  joinLiveClass,
  getLiveClassSettings,
  updateLiveClassSettings
} = require('../controllers/liveClassController');

// Live Class Settings routes
router.get('/settings', getLiveClassSettings);
router.post('/settings', updateLiveClassSettings);
router.put('/settings', updateLiveClassSettings);

// Stats & General routes
router.get('/stats', getLiveClassStats);
router.get('/', getLiveClasses);
router.post('/schedule', scheduleLiveClass);
router.post('/', scheduleLiveClass);

// Single session routes
router.get('/:id', getLiveClassById);
router.put('/:id', updateLiveClass);
router.patch('/:id', updateLiveClass);
router.delete('/:id', deleteLiveClass);
router.patch('/:id/status', updateLiveClassStatus);
router.post('/:id/join', joinLiveClass);

module.exports = router;
