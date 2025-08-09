const express = require('express');
const Research = require('../models/Research');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/research
// @desc    Get all research projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const research = await Research.find().sort({ createdAt: -1 });
    res.json(research);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/research/:id
// @desc    Get research project by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);
    if (!research) {
      return res.status(404).json({ message: 'Research project not found' });
    }
    res.json(research);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/research
// @desc    Create new research project
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const research = new Research(req.body);
    await research.save();
    res.status(201).json(research);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/research/:id
// @desc    Update research project
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const research = await Research.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!research) {
      return res.status(404).json({ message: 'Research project not found' });
    }
    res.json(research);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/research/:id
// @desc    Delete research project
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const research = await Research.findByIdAndDelete(req.params.id);
    if (!research) {
      return res.status(404).json({ message: 'Research project not found' });
    }
    res.json({ message: 'Research project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/research/:id/upload-image
// @desc    Upload image for research project
// @access  Private
router.post('/:id/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const research = await Research.findById(req.params.id);
    if (!research) {
      return res.status(404).json({ message: 'Research project not found' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    research.images.push(imageUrl);
    await research.save();

    res.json({ imageUrl, research });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

