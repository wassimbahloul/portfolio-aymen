const mongoose = require('mongoose');

const talkSchema = new mongoose.Schema({
  type: { type: String, required: true }, // talk, seminar, etc.
  date: { type: String, required: true },
  name: { type: String, required: true },
  link: { type: String },
  slide: { type: String }, // fichier unique (PDF, PPT, etc.)
  files: [String] // fichiers additionnels (optionnels)
});

module.exports = mongoose.model('Talk', talkSchema);
