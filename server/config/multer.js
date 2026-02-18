const multer = require('multer');
const path = require('path');

// Storage for videos
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Storage for reels
const reelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/reels/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Storage for subtitles
const subtitleStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/subtitles/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for videos
const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mkv|mov/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed'));
  }
};

// File filter for subtitles
const subtitleFilter = (req, file, cb) => {
  const allowedTypes = /vtt|srt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Only .vtt or .srt subtitle files are allowed'));
  }
};

const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

const uploadReel = multer({
  storage: reelStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

const uploadSubtitle = multer({
  storage: subtitleStorage,
  fileFilter: subtitleFilter,
  limits: { fileSize: 1 * 1024 * 1024 } // 1MB
});

module.exports = { uploadVideo, uploadReel, uploadSubtitle };