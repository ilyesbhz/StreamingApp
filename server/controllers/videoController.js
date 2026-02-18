const Video = require('../models/Video');
const User = require('../models/User');

// Upload Video
exports.uploadVideo = async (req, res) => {
  try {
    const { title, description, category, duration } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    const video = await Video.create({
      title,
      description,
      category,
      duration: parseInt(duration),
      videoUrl: `/uploads/videos/${req.file.filename}`,
      uploadedBy: req.user.id
    });

    res.status(201).json({
      message: 'Video uploaded successfully',
      video
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// Get All Videos
exports.getAllVideos = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const videos = await Video.find(query)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Single Video
exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('uploadedBy', 'name');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment view count
    video.views += 1;
    await video.save();

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Watch History
exports.updateWatchHistory = async (req, res) => {
  try {
    const { videoId, progress } = req.body;
    const userId = req.user.id;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Update user preferences (for recommendations)
    const user = await User.findById(userId);
    const currentScore = user.preferences.get(video.category) || 0;
    user.preferences.set(video.category, currentScore + 3);

    // Update watch history
    const existingHistory = user.watchHistory.find(
      h => h.videoId.toString() === videoId
    );

    if (existingHistory) {
      existingHistory.progress = progress;
      existingHistory.watchedAt = Date.now();
    } else {
      user.watchHistory.push({ videoId, progress });
    }

    await user.save();

    res.json({ message: 'Watch history updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like Video
exports.likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    video.likes += 1;
    await video.save();

    // Update user preferences
    const user = await User.findById(req.user.id);
    const currentScore = user.preferences.get(video.category) || 0;
    user.preferences.set(video.category, currentScore + 5);
    await user.save();

    res.json({ message: 'Video liked', likes: video.likes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add Subtitle to Video
exports.addSubtitle = async (req, res) => {
  try {
    const { language } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Subtitle file is required' });
    }

    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    video.subtitles.push({
      language,
      url: `/uploads/subtitles/${req.file.filename}`
    });

    await video.save();

    res.json({
      message: 'Subtitle added successfully',
      subtitles: video.subtitles
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Video
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};