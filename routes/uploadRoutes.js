const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload
// @access  Private (but we'll keep it simple for now)
router.post('/', upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const fileUrls = req.files.map(file => {
    // Construct the URL to access the static file
    // We assume the frontend knows the base URL, so we just return the path
    return `/uploads/${file.filename}`;
  });

  res.json({
    message: 'Images uploaded successfully',
    urls: fileUrls
  });
});

module.exports = router;
