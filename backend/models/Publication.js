const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  authors: [{
    name: String,
    isMainAuthor: {
      type: Boolean,
      default: false
    }
  }],
  journal: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  volume: String,
  issue: String,
  pages: String,
  doi: String,
  abstract: String,
  keywords: [String],
  type: {
    type: String,
    enum: ['journal', 'conference', 'book', 'chapter', 'preprint'],
    default: 'journal'
  },
  status: {
    type: String,
    enum: ['published', 'accepted', 'submitted', 'in_preparation'],
    default: 'published'
  },
  links: [{
    title: String,
    url: String
  }],
  file: String,
  citationCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Publication', publicationSchema);

