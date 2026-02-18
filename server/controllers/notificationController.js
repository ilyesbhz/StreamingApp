const Notification = require('../models/Notification');
const User = require('../models/User');

// Get notifications for the current user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching count', error: error.message });
  }
};

// Mark a single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error marking as read', error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking all as read', error: error.message });
  }
};

// Send notification to a specific user (admin or system use)
exports.sendNotification = async (req, res) => {
  try {
    const { recipientId, type, title, message, link } = req.body;

    if (!recipientId || !type || !title || !message) {
      return res.status(400).json({ message: 'recipientId, type, title, and message are required' });
    }

    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      link: link || '',
      sender: req.user._id
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error sending notification', error: error.message });
  }
};

// Broadcast notification to all users (admin only — for promos, new movies)
exports.broadcast = async (req, res) => {
  try {
    const { type, title, message, link } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ message: 'type, title, and message are required' });
    }

    const users = await User.find({}).select('_id');
    const notifications = users.map(u => ({
      recipient: u._id,
      type,
      title,
      message,
      link: link || '',
      sender: req.user._id
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({ message: `Notification sent to ${users.length} users` });
  } catch (error) {
    res.status(500).json({ message: 'Error broadcasting', error: error.message });
  }
};

// Helper: create a notification programmatically (used by other controllers)
exports.createNotification = async ({ recipient, sender, type, title, message, link }) => {
  try {
    if (recipient.toString() === sender?.toString()) return null; // Don't notify yourself
    return await Notification.create({ recipient, sender, type, title, message, link: link || '' });
  } catch (error) {
    console.error('Notification creation error:', error.message);
    return null;
  }
};
