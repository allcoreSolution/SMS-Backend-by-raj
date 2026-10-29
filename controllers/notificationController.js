const Notification = require('../models/Notification');

// Notifications helper (no auto-seed)
const seedNotificationsIfEmpty = async () => {};

// @desc    Get all notifications with unread count
// @route   GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(30);
    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({ isRead: false });
    res.status(200).json({ success: true, message: 'Marked as read', data: notification, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true, readAt: new Date() });
    res.status(200).json({ success: true, message: 'All notifications marked as read', unreadCount: 0 });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new notification
// @route   POST /api/notifications
exports.createNotification = async (req, res, next) => {
  try {
    const { title, message, type, priority, link, targetRole } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const notification = await Notification.create({
      title,
      message,
      type: type || 'system',
      priority: priority || 'normal',
      link: link || '/',
      targetRole: targetRole || 'Teacher',
      isRead: false
    });

    res.status(201).json({ success: true, message: 'Notification created', data: notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    const unreadCount = await Notification.countDocuments({ isRead: false });
    res.status(200).json({ success: true, message: 'Notification deleted', unreadCount });
  } catch (error) {
    next(error);
  }
};
