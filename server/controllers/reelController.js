const Reel = require('../models/Reel');

// Upload Reel
exports.uploadReel = async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Reel video is required' });
    }

    const reel = await Reel.create({
      title,
      videoUrl: `/uploads/reels/${req.file.filename}`,
      uploadedBy: req.user.id
    });

    res.status(201).json({
      message: 'Reel uploaded successfully',
      reel
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// Get All Reels
exports.getAllReels = async (req, res) => {
  try {
    const reels = await Reel.find()
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(reels);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Increment Reel View
exports.incrementView = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    reel.views += 1;
    await reel.save();

    res.json({ views: reel.views });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like Reel
exports.likeReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    reel.likes += 1;
    await reel.save();

    res.json({ likes: reel.likes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Reel
exports.deleteReel = async (req, res) => {
  try {
    const reel = await Reel.findByIdAndDelete(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    res.json({ message: 'Reel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};