const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getDiscussions,
  createDiscussion,
  toggleLike,
  addComment,
  deleteDiscussion
} = require('../controllers/discussionController');

router.get('/', auth, getDiscussions);
router.post('/', auth, createDiscussion);
router.post('/:id/like', auth, toggleLike);
router.post('/:id/comment', auth, addComment);
router.delete('/:id', auth, deleteDiscussion);

module.exports = router;
