const Notification = require('../models/Notification');

// Seed initial notifications for teachers if none exist
const seedNotificationsIfEmpty = async () => {
  try {
    const count = await Notification.countDocuments();
    if (count === 0) {
      await Notification.insertMany([
        {
          title: 'Term 1 Exam Schedule Finalized',
          message: 'Mid-Term assessment date sheet for Classes VI-X is published. Verify question papers.',
          type: 'exam',
          priority: 'urgent',
          targetRole: 'Teacher',
          link: '/online-exams',
          isRead: false
        },
        {
          title: 'Student Leave Applications',
          message: '2 students from Class 10-A have submitted medical leave requests awaiting recommendation.',
          type: 'leave',
          priority: 'high',
          targetRole: 'Teacher',
          link: '/apply-leave',
          isRead: false
        },
        {
          title: 'Holistic Progress Card (HPC) Due',
          message: '3-Domain competency reviews for Class VI learners are pending teacher completion.',
          type: 'hpc',
          priority: 'normal',
          targetRole: 'Teacher',
          link: '/progress-cards',
          isRead: false
        },
        {
          title: 'Daily Attendance Reminder',
          message: 'Morning period 1 attendance has been successfully synced with the master register.',
          type: 'attendance',
          priority: 'normal',
          targetRole: 'Teacher',
          link: '/student-attendance',
          isRead: false
        },
        {
          title: 'Parent-Teacher Meeting (PTM)',
          message: 'PTM slots for upcoming Saturday have been scheduled and notified to parents.',
          type: 'system',
          priority: 'high',
          targetRole: 'Teacher',
          link: '/ptm',
          isRead: true,
          readAt: new Date()
        }
      ]);
    }
  } catch (err) {
    console.warn('Notification seed error:', err.message);
  }
};
seedNotificationsIfEmpty();

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
