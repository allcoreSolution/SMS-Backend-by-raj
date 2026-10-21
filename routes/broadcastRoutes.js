const express = require('express');
const router = express.Router();
const {
  sendBroadcast,
  getBroadcasts,
  getBroadcastStats,
  getRecipientsEstimate,
  deleteBroadcast
} = require('../controllers/broadcastController');

router.get('/', getBroadcasts);
router.post('/send', sendBroadcast);
router.get('/stats', getBroadcastStats);
router.get('/recipients-estimate', getRecipientsEstimate);
router.delete('/:id', deleteBroadcast);

module.exports = router;
