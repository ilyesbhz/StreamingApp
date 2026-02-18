const Video = require('../models/Video');
const User = require('../models/User');

exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get user preferences
    const preferences = user.preferences;
    
    // Get watched video IDs
    const watchedVideoIds = user.watchHistory.map(h => h.videoId);
    
    // Find unwatched videos
    let videos = await Video.find({
      _id: { $nin: watchedVideoIds }
    });

    // Score and sort videos
    videos = videos.map(video => {
      const categoryScore = preferences.get(video.category) || 0;
      return {
        ...video.toObject(),
        recommendationScore: categoryScore
      };
    });

    // Sort by score (descending)
    videos.sort((a, b) => b.recommendationScore - a.recommendationScore);

    // Return top 20 recommendations
    res.json(videos.slice(0, 20));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};