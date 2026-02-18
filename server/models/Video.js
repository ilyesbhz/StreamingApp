const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    required: true,
    enum: ['Action', 'Drama', 'Comedy', 'Horror', 'Sci-Fi', 'Romance', 'Documentary']
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  subtitles: [{
    language: String,
    url: String
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);