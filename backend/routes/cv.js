const express = require('express');
const CV = require('../models/CV');
const CvData = require('../models/CvData');
const auth = require('../middleware/auth');
const { uploadPDF } = require('../middleware/cloudinary');

const router = express.Router();

// @route   GET /cv
// @desc    Get CV data
// @access  Public
router.get('/', async (req, res) => {
  try {
    let cv = await CV.findOne();
    if (!cv) {
      cv = new CV({});
      await cv.save();
    }
    res.json(cv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /cv/upload
// @desc    Upload CV file to Cloudinary
// @access  Private
router.post('/upload', auth, uploadPDF.single('cv'), async (req, res) => {
  try {
    console.log('📤 CV Upload to Cloudinary...');
    console.log('📁 Request file:', req.file);
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log('📄 File uploaded to Cloudinary:', req.file.path);
    console.log('� Cloudinary URL:', req.file.path);
    
    // Cloudinary renvoie l'URL complète dans req.file.path
    const fileUrl = req.file.path;
    
    let cv = await CV.findOne();
    if (!cv) {
      cv = new CV({ cvFile: fileUrl });
      console.log('🆕 Created new CV record');
    } else {
      console.log('📝 Updating existing CV record');
      cv.cvFile = fileUrl;
    }
    await cv.save();
    console.log('💾 CV saved to database');
    
    // Return cvUrl instead of fileUrl to match frontend expectations
    res.json({ cvUrl: fileUrl });
    console.log('✅ CV upload successful');
  } catch (error) {
    console.error('❌ CV upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /cv/data
// @desc    Get structured CV data
// @access  Private (Admin only)
router.get('/data', auth, async (req, res) => {
  try {
    let cvData = await CvData.findOne();
    if (!cvData) {
      return res.json(null);
    }
    res.json(cvData);
  } catch (error) {
    console.error('Error fetching CV data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /cv/public
// @desc    Get structured CV data for public display
// @access  Public
router.get('/public', async (req, res) => {
  try {
    let cvData = await CvData.findOne();
    if (!cvData) {
      return res.json(null);
    }
    res.json(cvData);
  } catch (error) {
    console.error('Error fetching public CV data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /cv/data
// @desc    Create or update structured CV data
// @access  Private (Admin only)
router.post('/data', auth, async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      nationality,
      email,
      otherInfo,
      pdfUrl,
      academicEmployment,
      education
    } = req.body;

    let cvData = await CvData.findOne();
    
    if (cvData) {
      // Update existing CV data
      cvData.fullName = fullName;
      cvData.dateOfBirth = dateOfBirth;
      cvData.nationality = nationality;
      cvData.email = email;
      cvData.otherInfo = otherInfo;
      cvData.pdfUrl = pdfUrl;
      cvData.academicEmployment = academicEmployment || [];
      cvData.education = education || [];
      cvData.updatedAt = new Date();
    } else {
      // Create new CV data
      cvData = new CvData({
        fullName,
        dateOfBirth,
        nationality,
        email,
        otherInfo,
        pdfUrl,
        academicEmployment: academicEmployment || [],
        education: education || []
      });
    }

    await cvData.save();
    res.json(cvData);

  } catch (error) {
    console.error('Error saving CV data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /cv/data
// @desc    Update structured CV data
// @access  Private (Admin only)
router.put('/data', auth, async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      nationality,
      email,
      otherInfo,
      pdfUrl,
      academicEmployment,
      education
    } = req.body;

    let cvData = await CvData.findOne();
    
    if (!cvData) {
      return res.status(404).json({ message: 'CV data not found' });
    }

    // Update CV data
    cvData.fullName = fullName;
    cvData.dateOfBirth = dateOfBirth;
    cvData.nationality = nationality;
    cvData.email = email;
    cvData.otherInfo = otherInfo;
    cvData.pdfUrl = pdfUrl;
    cvData.academicEmployment = academicEmployment || [];
    cvData.education = education || [];
    cvData.updatedAt = new Date();

    await cvData.save();
    res.json(cvData);

  } catch (error) {
    console.error('Error updating CV data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /cv/data
// @desc    Delete structured CV data
// @access  Private (Admin only)
router.delete('/data', auth, async (req, res) => {
  try {
    const cvData = await CvData.findOne();
    
    if (!cvData) {
      return res.status(404).json({ message: 'CV data not found' });
    }

    await CvData.deleteOne({ _id: cvData._id });
    res.json({ message: 'CV data deleted successfully' });

  } catch (error) {
    console.error('Error deleting CV data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;