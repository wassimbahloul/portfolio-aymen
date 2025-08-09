const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  
  // Contact Information
  email: {
    type: String,
    required: true
  },
  secondaryEmail: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  mobile: {
    type: String,
    default: ''
  },
  
  // Office Information (maintien de la compatibilité)
  office: {
    type: String,
    default: ''
  },
  institution: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  officeNumber: {
    type: String,
    default: ''
  },
  building: {
    type: String,
    default: ''
  },
  
  // Address Information (structure étendue + legacy)
  address: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Separate address fields for better structure
  addressDetails: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  
  // Office Hours
  officeHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    startTime: String,
    endTime: String
  }],
  
  // Social Links (structure étendue)
  socialLinks: {
    linkedin: String,
    twitter: String,
    researchgate: String,
    orcid: String,
    googleScholar: String,
    website: String
  },
  
  // Additional Links
  additionalLinks: [{
    title: String,
    url: String,
    description: String
  }],
  
  // Contact Preferences
  preferredContact: {
    type: String,
    enum: ['email', 'phone', 'office'],
    default: 'email'
  },
  contactInstructions: {
    type: String,
    default: ''
  },
  availableForCollaboration: {
    type: Boolean,
    default: false
  },
  acceptingStudents: {
    type: Boolean,
    default: false
  },
  availableForReviews: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);