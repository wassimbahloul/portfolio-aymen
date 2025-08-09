const express = require('express');
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/contact
// @desc    Get contact data
// @access  Public
router.get('/', async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) {
      // Create default contact data if none exists
      contact = new Contact({
        email: 'contact@example.com'
      });
      await contact.save();
    }
    res.json(contact);
  } catch (error) {
    console.error('Error getting contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/contact
// @desc    Update contact data
// @access  Private
router.put('/', auth, async (req, res) => {
  try {
    let contact = await Contact.findOne();
    
    // Prepare the data to update
    const updateData = { ...req.body };
    
    // Handle address field - convert string to object if needed
    if (updateData.address) {
      if (typeof updateData.address === 'string') {
        // If address is a string, store it in a 'full' field within address object
        updateData.address = {
          full: updateData.address,
          street: '',
          city: '',
          postalCode: '',
          country: ''
        };
      } else if (typeof updateData.address === 'object' && updateData.address !== null) {
        // Ensure all required fields exist
        updateData.address = {
          street: updateData.address.street || '',
          city: updateData.address.city || '',
          postalCode: updateData.address.postalCode || '',
          country: updateData.address.country || '',
          full: updateData.address.full || ''
        };
      }
    }
    
    // Handle addressDetails separately for better structure
    if (updateData.addressDetails) {
      updateData.addressDetails = {
        street: updateData.addressDetails.street || '',
        city: updateData.addressDetails.city || '',
        postalCode: updateData.addressDetails.postalCode || '',
        country: updateData.addressDetails.country || ''
      };
    }
    
    // Handle socialLinks - ensure it's an object
    if (updateData.socialLinks) {
      if (typeof updateData.socialLinks !== 'object' || updateData.socialLinks === null) {
        updateData.socialLinks = {};
      }
    }
    
    // Handle arrays - ensure they are arrays
    if (updateData.officeHours && !Array.isArray(updateData.officeHours)) {
      updateData.officeHours = [];
    }
    
    if (updateData.additionalLinks && !Array.isArray(updateData.additionalLinks)) {
      updateData.additionalLinks = [];
    }
    
    // Filter out empty office hours
    if (updateData.officeHours && Array.isArray(updateData.officeHours)) {
      updateData.officeHours = updateData.officeHours.filter(hour => 
        hour && hour.day && hour.startTime && hour.endTime
      );
    }
    
    // Filter out empty additional links
    if (updateData.additionalLinks && Array.isArray(updateData.additionalLinks)) {
      updateData.additionalLinks = updateData.additionalLinks.filter(link => 
        link && (link.title || link.url)
      );
    }
    
    if (!contact) {
      contact = new Contact(updateData);
    } else {
      // Use set method for better control over nested objects
      Object.keys(updateData).forEach(key => {
        if (key === 'address' || key === 'socialLinks' || key === 'addressDetails') {
          contact.set(key, updateData[key]);
        } else {
          contact[key] = updateData[key];
        }
      });
    }
    
    await contact.save();
    res.json(contact);
    
  } catch (error) {
    console.error('Error updating contact:', error);
    
    // More detailed error handling
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: `Invalid data type for field: ${error.path}`, 
        field: error.path,
        value: error.value 
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/contact
// @desc    Delete contact data (for testing purposes)
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    await Contact.deleteMany({});
    res.json({ message: 'All contact data deleted' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;