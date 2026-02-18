const Discussion = require('../models/Discussion');
const { createNotification } = require('./notificationController');

// Get all discussions (with optional category filter)
exports.getDiscussions = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const discussions = await Discussion.find(filter)
      .populate('user', 'name')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 });
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching discussions', error: error.message });
  }
};

// Create a discussion
exports.createDiscussion = async (req, res) => {
  try {
    const { title, content, category, movieTitle, rating } = req.body;
    const discussion = new Discussion({
      user: req.user._id,
      title,
      content,
      category,
      movieTitle,
      rating
    });
    await discussion.save();
    await discussion.populate('user', 'name');
    res.status(201).json(discussion);
  } catch (error) {
    res.status(500).json({ message: 'Error creating discussion', error: error.message });
  }
};

// Like / unlike a discussion
exports.toggleLike = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    const idx = discussion.likes.indexOf(req.user._id);
    if (idx === -1) {
      discussion.likes.push(req.user._id);

      // Notify the discussion author about the like
      await createNotification({
        recipient: discussion.user,
        sender: req.user._id,
        type: 'like',
        title: 'New like on your post',
        message: `${req.user.name} liked your post "${discussion.title}"`,
        link: '/discussions'
      });
    } else {
      discussion.likes.splice(idx, 1);
    }
    await discussion.save();
    await discussion.populate('user', 'name');
    await discussion.populate('comments.user', 'name');
    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling like', error: error.message });
  }
};

// Add a comment
exports.addComment = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    discussion.comments.push({ user: req.user._id, text: req.body.text });
    await discussion.save();
    await discussion.populate('user', 'name');
    await discussion.populate('comments.user', 'name');

    // Notify the discussion author about the comment
    await createNotification({
      recipient: discussion.user._id || discussion.user,
      sender: req.user._id,
      type: 'comment',
      title: 'New comment on your post',
      message: `${req.user.name} commented on "${discussion.title}"`,
      link: '/discussions'
    });

    res.status(201).json(discussion);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};

// Delete a discussion (owner only)
exports.deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });
    if (discussion.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await discussion.deleteOne();
    res.json({ message: 'Discussion deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting discussion', error: error.message });
  }
};
