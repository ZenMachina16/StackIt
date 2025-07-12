const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    List user's unread notifications
// @access  Protected
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Filter unread notifications and sort by newest first
    const unreadNotifications = user.notifications
      .filter(notification => !notification.isRead)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      notifications: unreadNotifications,
      count: unreadNotifications.length
    });
  } catch (error) {
    console.error('Get notifications error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Protected
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id: notificationId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the notification
    const notification = user.notifications.id(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if already read
    if (notification.isRead) {
      return res.status(400).json({
        success: false,
        message: 'Notification is already marked as read'
      });
    }

    // Mark as read
    notification.isRead = true;
    await user.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark notification read error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notification'
    });
  }
});

module.exports = router; 