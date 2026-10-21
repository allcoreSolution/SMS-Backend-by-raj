const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification
} = require('../controllers/notificationController');

router.get('/', getNotifications);
router.post('/', createNotification);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
