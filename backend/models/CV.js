const mongoose = require('mongoose');

const cvSchema = new mongoose.Schema({
  cvFile: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('CV', cvSchema);