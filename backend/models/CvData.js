const mongoose = require('mongoose');

const academicEmploymentSchema = new mongoose.Schema({
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  department: {
    type: String
  },
  institution: {
    type: String
  },
  description: {
    type: String
  }
});

const educationSchema = new mongoose.Schema({
  graduationDate: {
    type: Date
  },
  title: {
    type: String
  },
  department: {
    type: String
  },
  university: {
    type: String
  },
  supervisor: {
    type: String
  },
  grade: {
    type: String
  },
  description: {
    type: String
  }
});

const cvDataSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  nationality: {
    type: String
  },
  email: {
    type: String
  },
  otherInfo: {
    type: String
  },
  pdfUrl: {
    type: String
  },
  
  // Academic Employment
  academicEmployment: [academicEmploymentSchema],
  
  // Education
  education: [educationSchema],
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
cvDataSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CvData', cvDataSchema);
