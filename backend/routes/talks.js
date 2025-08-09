const express = require('express');
const router = express.Router();
const multer = require('multer');
const Talk = require('../models/Talk');
const fs = require('fs');
const path = require('path');

// Configure multer to preserve original file extension and validate file type
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    // Preserve original file name and extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${path.basename(file.originalname, ext)}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF files for slides
  const allowedTypes = ['application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Serve static files from uploads directory
router.use('/Uploads', express.static(path.join(__dirname, '../Uploads')));

// 🔹 Get All with optional filters
router.get('/', async (req, res) => {
  const filters = {};
  if (req.query.type) filters.type = req.query.type;
  const talks = await Talk.find(filters).sort({ date: -1 });
  res.json(talks);
});

// 🔹 Get One
router.get('/:id', async (req, res) => {
  const talk = await Talk.findById(req.params.id);
  if (!talk) return res.status(404).json({ error: 'Talk not found' });
  res.json(talk);
});

// 🔹 Create
router.post('/', async (req, res) => {
  const talk = new Talk(req.body);
  await talk.save();
  res.json(talk);
});

// 🔹 Update
router.put('/:id', async (req, res) => {
  const updated = await Talk.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ error: 'Talk not found' });
  res.json(updated);
});

// 🔹 Delete
router.delete('/:id', async (req, res) => {
  const talk = await Talk.findById(req.params.id);
  if (!talk) return res.status(404).json({ error: 'Talk not found' });
  if (talk.slide) {
    try {
      fs.unlinkSync(path.join(__dirname, '../Uploads', talk.slide));
    } catch (err) {
      console.error('Error deleting slide file:', err);
    }
  }
  for (const file of talk.files || []) {
    try {
      fs.unlinkSync(path.join(__dirname, '../Uploads', file));
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  }
  await Talk.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// 🔹 Upload Slide (1 fichier)
router.post('/:id/upload', upload.single('slides'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const talk = await Talk.findById(req.params.id);
  if (!talk) return res.status(404).json({ error: 'Talk not found' });
  // Delete previous slide if it exists
  if (talk.slide) {
    try {
      fs.unlinkSync(path.join(__dirname, '../Uploads', talk.slide));
    } catch (err) {
      console.error('Error deleting previous slide:', err);
    }
  }
  talk.slide = req.file.filename;
  await talk.save();
  res.json({ filename: req.file.filename });
});

// 🔹 Upload fichiers multiples
router.post('/:id/upload-files', upload.array('files'), async (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
  const talk = await Talk.findById(req.params.id);
  if (!talk) return res.status(404).json({ error: 'Talk not found' });
  const fileNames = req.files.map(f => f.filename);
  talk.files.push(...fileNames);
  await talk.save();
  res.json({ files: fileNames });
});

// 🔹 Delete file by index
router.delete('/:id/files/:index', async (req, res) => {
  const talk = await Talk.findById(req.params.id);
  if (!talk) return res.status(404).json({ error: 'Talk not found' });
  const idx = parseInt(req.params.index);
  if (talk.files[idx]) {
    try {
      fs.unlinkSync(path.join(__dirname, '../Uploads', talk.files[idx]));
      talk.files.splice(idx, 1);
      await talk.save();
      res.json({ message: 'File removed' });
    } catch (err) {
      console.error('Error deleting file:', err);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

module.exports = router;