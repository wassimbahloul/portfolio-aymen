const mongoose = require('mongoose');

const teachingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['undergraduate', 'graduate', 'phd'],
    required: true
  },
  institution: {
    type: String,
    required: true
  },
  department: String,
  academicYear: String, // Format: "2023-2024"
  semester: {
    type: String,
    enum: ['semester 1', 'semester 2']
  },
  description: String,
  files: [{
  name: { type: String, required: true },
  path: { type: String, required: true },
  type: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
}]

}, {
  timestamps: true
});

module.exports = mongoose.model('Teaching', teachingSchema);