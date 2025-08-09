const mongoose = require('mongoose');

const researchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Research Project'
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'planned'],
    default: 'ongoing'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  collaborators: [{
    name: String,
    institution: String,
    role: String
  }],
 supervisor: [{
  name: String,
  institution: String,
  role: String
}],
  // Changement: funding devient un tableau au lieu d'un objet
  funding: [{
    source: String,
    amount: String,
    period: String
  }],
  publications: [{
    title: String,
    journal: String,
    year: String,
    link: String
  }],
  // Changement: renommer 'links' en 'externalLinks' pour correspondre au frontend
  externalLinks: [{
    title: String,
    url: String
  }],
  images: [String],
  tags: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Research', researchSchema);