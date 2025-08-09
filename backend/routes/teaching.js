const express = require('express');
const path = require('path');
const multer = require('multer');
const Teaching = require('../models/Teaching');
const auth = require('../middleware/auth');

const router = express.Router();

// === CONFIGURATION MULTER ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Décodage pour éviter les caractères illisibles
    const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, Date.now() + '-' + fileName);
  }
});
const upload = multer({ storage });

// === ROUTES ===

// GET all
router.get('/', async (req, res) => {
  try {
    const teaching = await Teaching.find().sort({ 
      academicYear: -1, 
      semester: -1,
      createdAt: -1 
    });
    res.json(teaching);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET by ID
router.get('/:id', async (req, res) => {
  try {
    const teaching = await Teaching.findById(req.params.id);
    if (!teaching) {
      return res.status(404).json({ message: 'Teaching activity not found' });
    }
    res.json(teaching);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create
router.post('/', auth, async (req, res) => {
  try {
    const { title, institution, level } = req.body;
    if (!title || !institution || !level) {
      return res.status(400).json({ message: 'Les champs titre, institution et niveau sont requis' });
    }

    const teaching = new Teaching(req.body);
    await teaching.save();
    res.status(201).json(teaching);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Données invalides', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update
router.put('/:id', auth, async (req, res) => {
  try {
    const teaching = await Teaching.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!teaching) {
      return res.status(404).json({ message: 'Teaching activity not found' });
    }
    res.json(teaching);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Données invalides', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE
router.delete('/:id', auth, async (req, res) => {
  try {
    const teaching = await Teaching.findByIdAndDelete(req.params.id);
    if (!teaching) {
      return res.status(404).json({ message: 'Teaching activity not found' });
    }
    res.json({ message: 'Teaching activity deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPLOAD files
router.post('/:id/upload', auth, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const teaching = await Teaching.findById(req.params.id);
    if (!teaching) {
      return res.status(404).json({ message: 'Teaching activity not found' });
    }

    req.files.forEach(file => {
      const fileUrl = `/uploads/${file.filename}`;
      teaching.files.push({
        name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
        path: fileUrl,
        type: file.mimetype
      });
    });

    await teaching.save();

    res.json({ 
      message: 'Files uploaded successfully',
      files: req.files.map(f => ({
        name: Buffer.from(f.originalname, 'latin1').toString('utf8'),
        path: `/uploads/${f.filename}`,
        type: f.mimetype
      })),
      teaching 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
