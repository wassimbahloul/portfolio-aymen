const express = require('express');
const Publication = require('../models/Publication');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/publications
// @desc    Get all publications
// @access  Public
router.get('/', async (req, res) => {
  try {
    const publications = await Publication.find().sort({ year: -1, createdAt: -1 });
    res.json(publications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/publications/:id
// @desc    Get publication by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }
    res.json(publication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/publications
// @desc    Create new publication
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const publication = new Publication(req.body);
    await publication.save();
    res.status(201).json(publication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/publications/:id
// @desc    Update publication
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const publication = await Publication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }
    res.json(publication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/publications/:id
// @desc    Delete publication
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const publication = await Publication.findByIdAndDelete(req.params.id);
    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }
    res.json({ message: 'Publication deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/publications/:id/upload-file
// @desc    Upload file for publication
// @access  Private
router.post('/:id/upload-file', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    publication.file = fileUrl;
    await publication.save();

    res.json({ fileUrl, publication });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;