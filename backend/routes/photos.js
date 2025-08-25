const express = require('express');
const Photo = require('../models/Photo');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

// (Legacy) Helper kept for backward compatibility; new code now inlined to force .jpg extension
async function generateThumbnail(filePath, outputPath, maxWidth = 300, maxHeight = 300) {
  try {
    await sharp(filePath)
      .resize({ width: maxWidth, height: maxHeight, fit: sharp.fit.inside, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
  } catch (error) {
    throw new Error('Thumbnail generation failed: ' + error.message);
  }
}

// @route   GET /api/photos
// @desc    Get all public photos
// @access  Public
router.get('/', async (req, res) => {
  try {
    const photos = await Photo.find({ isPublic: true }).sort({ order: 1, date: -1 });
    // Add full image and thumbnail URLs
    const photosWithUrls = photos.map(photo => ({
      ...photo.toObject(),
      imageUrl: `/uploads/${photo.filename}`,
      thumbnailUrl: photo.thumbnailFilename ? `/uploads/thumbnails/${photo.thumbnailFilename}` : `/uploads/${photo.filename}`
    }));
    res.json(photosWithUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/photos/admin
// @desc    Get all photos (including private) for admin
// @access  Private
router.get('/admin', auth, async (req, res) => {
  try {
    const photos = await Photo.find().sort({ order: 1, date: -1 });
    const photosWithUrls = photos.map(photo => ({
      ...photo.toObject(),
      imageUrl: `/uploads/${photo.filename}`,
      thumbnailUrl: photo.thumbnailFilename ? `/uploads/thumbnails/${photo.thumbnailFilename}` : `/uploads/${photo.filename}`
    }));
    res.json(photosWithUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/photos/:id
// @desc    Get photo by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    res.json({
      ...photo.toObject(),
      imageUrl: `/uploads/${photo.filename}`,
      thumbnailUrl: photo.thumbnailFilename ? `/uploads/thumbnails/${photo.thumbnailFilename}` : `/uploads/${photo.filename}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/photos
// @desc    Upload new photos
// @access  Private
router.post('/', auth, upload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const photoData = JSON.parse(req.body.photoData || '{}');
    const photos = [];

    for (const file of req.files) {
      // Generate thumbnail with consistent .jpg extension (avoid mismatched content/extension)
      const originalExt = path.extname(file.filename); // e.g. .png / .jpg
      const baseName = path.basename(file.filename, originalExt);
      const thumbnailFilename = `thumb_${baseName}.jpg`;
      const thumbnailPath = path.join(__dirname, '../uploads/thumbnails', thumbnailFilename);
      await sharp(file.path)
        .resize({ width: 300, height: 300, fit: sharp.fit.inside, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      const photo = new Photo({
        title: photoData.title || file.originalname,
        description: photoData.description || '',
        filename: file.filename,
        thumbnailFilename: thumbnailFilename,
        originalName: file.originalname,
        category: photoData.category || 'conference',
        location: photoData.location || '',
        event: photoData.event || '',
        tags: photoData.tags || [],
        photographer: photoData.photographer || '',
        altText: photoData.altText || '',
        credit: photoData.credit || '',
        people: photoData.people || [],
        isPublic: photoData.isPublic !== false,
        isFeatured: photoData.isFeatured || false,
        allowDownload: photoData.allowDownload !== false,
        order: photoData.order || 0
      });

      await photo.save();
      photos.push({
        ...photo.toObject(),
        imageUrl: `/uploads/${photo.filename}`,
        thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`
      });
    }

    res.status(201).json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// @route   PUT /api/photos/:id
// @desc    Update photo
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    const updatedData = {
      title: req.body.title || photo.title,
      description: req.body.description || photo.description,
      category: req.body.category || photo.category,
      location: req.body.location || photo.location,
      event: req.body.event || photo.event,
      tags: req.body.tags || photo.tags,
      photographer: req.body.photographer || photo.photographer,
      altText: req.body.altText || photo.altText,
      credit: req.body.credit || photo.credit,
      people: req.body.people || photo.people,
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : photo.isPublic,
      isFeatured: req.body.isFeatured !== undefined ? req.body.isFeatured : photo.isFeatured,
      allowDownload: req.body.allowDownload !== undefined ? req.body.allowDownload : photo.allowDownload,
      order: req.body.order !== undefined ? req.body.order : photo.order
    };

    const updatedPhoto = await Photo.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.json({
      ...updatedPhoto.toObject(),
      imageUrl: `/uploads/${updatedPhoto.filename}`,
      thumbnailUrl: updatedPhoto.thumbnailFilename ? `/uploads/thumbnails/${updatedPhoto.thumbnailFilename}` : `/uploads/${updatedPhoto.filename}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// @route   DELETE /api/photos/:id
// @desc    Delete photo
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Delete image and thumbnail files
    const imagePath = path.join(__dirname, '../uploads', photo.filename);
    const thumbnailPath = photo.thumbnailFilename ? path.join(__dirname, '../uploads/thumbnails', photo.thumbnailFilename) : null;

    await Promise.all([
      fs.unlink(imagePath).catch(err => console.warn('Error deleting image file:', err)),
      thumbnailPath ? fs.unlink(thumbnailPath).catch(err => console.warn('Error deleting thumbnail file:', err)) : Promise.resolve()
    ]);

    await Photo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// @route   POST /api/photos/upload
// @desc    Upload a single photo file (for standalone uploads)
// @access  Private
router.post('/upload', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const originalExt = path.extname(req.file.filename);
    const baseName = path.basename(req.file.filename, originalExt);
    const thumbnailFilename = `thumb_${baseName}.jpg`;
    const thumbnailPath = path.join(__dirname, '../uploads/thumbnails', thumbnailFilename);
    await sharp(req.file.path)
      .resize({ width: 300, height: 300, fit: sharp.fit.inside, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    res.json({
      filename: req.file.filename,
      originalName: req.file.originalname,
      imageUrl: `/uploads/${req.file.filename}`,
      thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

module.exports = router;