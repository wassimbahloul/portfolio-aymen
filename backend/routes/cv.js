const express = require('express');
const CV = require('../models/CV');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

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
// @desc    Upload CV file
// @access  Private
router.post('/upload', auth, upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    let cv = await CV.findOne();
    if (!cv) {
      cv = new CV({ cvFile: fileUrl });
    } else {
      cv.cvFile = fileUrl;
    }
    await cv.save();
    res.json({ fileUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;