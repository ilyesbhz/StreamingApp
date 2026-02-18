const express = require('express');
const router = express.Router();
const reelController = require('../controllers/reelController');
const { auth, isAdmin } = require('../middleware/auth');
const { uploadReel } = require('../config/multer');

router.get('/', reelController.getAllReels);
router.post('/upload', auth, isAdmin, uploadReel.single('reel'), reelController.uploadReel);
router.post('/:id/view', reelController.incrementView);
router.post('/:id/like', auth, reelController.likeReel);
router.delete('/:id', auth, isAdmin, reelController.deleteReel);

module.exports = router;