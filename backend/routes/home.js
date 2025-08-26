const express = require('express');
const Home = require('../models/Home');
const auth = require('../middleware/auth');
const { uploadImage } = require('../middleware/cloudinary');

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
// @desc    Upload profile or background image to Cloudinary
// @access  Private
router.post('/upload-image', auth, uploadImage.single('image'), async (req, res) => {
  try {
    console.log('📤 Image upload to Cloudinary...');
    console.log('📁 Request file:', req.file);
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('🖼️ Image uploaded to Cloudinary:', req.file.path);
    console.log('🔗 Cloudinary URL:', req.file.path);
    
    // Cloudinary renvoie l'URL complète dans req.file.path
    const imageUrl = req.file.path;
    
    console.log('✅ Image upload successful');
    res.json({ imageUrl });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

