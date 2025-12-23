const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/auth');
const { upload, processImage, processProfileImage } = require('../middleware/upload');

// Upload profile image
router.post(
  '/profile-image',
  authenticateToken,
  upload.single('profileImage'),
  processProfileImage,
  uploadController.uploadProfileImage
);

// Upload post attachment
router.post(
  '/post-attachment',
  authenticateToken,
  upload.single('attachment'),
  processImage,
  uploadController.uploadPostAttachment
);

// General file upload (for logos, etc.)
router.post(
  '/',
  authenticateToken,
  upload.single('file'),
  processImage,
  uploadController.uploadFile
);

// Delete file
router.delete(
  '/:filename',
  authenticateToken,
  uploadController.deleteFile
);

module.exports = router;