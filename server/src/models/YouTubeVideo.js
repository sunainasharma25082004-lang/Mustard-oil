const mongoose = require('mongoose');

const youtubeVideoSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: 200, default: 'Karyor Mustard Oil' },
    url: { type: String, required: true, trim: true },
    videoId: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('YouTubeVideo', youtubeVideoSchema);