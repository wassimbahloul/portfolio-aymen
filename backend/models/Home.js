const mongoose = require('mongoose');

const homeSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Dr. Nom Prénom'
  },
  subtitle: {
    type: String,
    default: 'Bienvenue sur mon portfolio'
  },
  description: {
    type: String,
    default: 'Description professionnelle...'
  },
  profileImage: {
    type: String,
    default: ''
  },
  backgroundImage: {
    type: String,
    default: ''
  },
  upcomingEvents: [{
    title: String,
    date: String,
    location: String,
    description: String,
    link: String
  }],
  onlineSeminars: [{
    title: String,
    description: String,
    link: String,
    youtubeChannel: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Home', homeSchema);

