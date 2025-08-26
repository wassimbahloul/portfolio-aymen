const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  filename: {
    type: String,
    required: true
  },
  thumbnailFilename: {
    type: String // Store the filename for the thumbnail
  },
  originalName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['conference', 'research', 'teaching', 'personal', 'awards', 'team', 'events'],
    default: 'conference'
  },
  date: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
    trim: true
  },
  event: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  photographer: {
    type: String,
    trim: true
  },
  altText: {
    type: String,
    trim: true
  },
  credit: {
    type: String,
    trim: true
  },
  people: [{
    name: { type: String, trim: true },
    role: { type: String, trim: true }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  allowDownload: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  // Cloudinary fields
  cloudinaryUrl: {
    type: String,
    trim: true
  },
  cloudinaryPublicId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Photo', photoSchema);