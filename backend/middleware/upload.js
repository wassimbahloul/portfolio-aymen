const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '../Uploads');
const thumbnailsDir = path.join(__dirname, '../Uploads/thumbnails');

async function ensureDirectories() {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(thumbnailsDir, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directories:', error);
  }
}

ensureDirectories();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `file-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;