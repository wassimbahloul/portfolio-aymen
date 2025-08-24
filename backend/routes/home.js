const express = require('express');
const Home = require('../models/Home');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/home
// @desc    Get home data
// @access  Public
router.get('/', async (req, res) => {
  try {
    let home = await Home.findOne();
    if (!home) {
      // Create default home data if none exists
      home = new Home({});
      await home.save();
    }
    res.json(home);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/home
// @desc    Update home data
// @access  Private
router.put('/', auth, async (req, res) => {
  try {
    let home = await Home.findOne();
    if (!home) {
      home = new Home(req.body);
    } else {
      Object.assign(home, req.body);
    }
    await home.save();
    res.json(home);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/home/upload-image
// @desc    Upload profile or background image
// @access  Private
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

