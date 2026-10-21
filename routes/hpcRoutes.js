const express = require('express');
const router = express.Router();
const hpcController = require('../controllers/hpcController');

// Stats
router.get('/stats', hpcController.getStats);

// Activities
router.get('/activities', hpcController.getActivities);
router.post('/activities', hpcController.createActivity);
router.put('/activities/:id', hpcController.updateActivity);
router.delete('/activities/:id', hpcController.deleteActivity);

// Progress Cards
router.get('/cards', hpcController.getProgressCards);
router.get('/cards/:id', hpcController.getProgressCardById);
router.post('/cards/batch', hpcController.createCardsForClass);
router.put('/cards/:id', hpcController.updateProgressCard);
router.delete('/cards/:id', hpcController.deleteProgressCard);

module.exports = router;
