const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { auth, isAdmin } = require('../middleware/auth');
const { uploadVideo, uploadSubtitle } = require('../config/multer');

// Public routes
router.get('/', videoController.getAllVideos);
router.get('/:id', videoController.getVideo);

// Protected routes
router.post('/upload', auth, isAdmin, uploadVideo.single('video'), videoController.uploadVideo);
router.post('/:id/subtitle', auth, isAdmin, uploadSubtitle.single('subtitle'), videoController.addSubtitle);
router.post('/watch-history', auth, videoController.updateWatchHistory);
router.post('/:id/like', auth, videoController.likeVideo);
router.delete('/:id', auth, isAdmin, videoController.deleteVideo);

module.exports = router;