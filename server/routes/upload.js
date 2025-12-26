const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/auth');
const { upload, uploadChatFile, processImage, processProfileImage, processChatFile } = require('../middleware/upload');

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

// Upload chat attachment (images, videos, files)
router.post(
  '/chat-attachment',
  authenticateToken,
  uploadChatFile.single('attachment'),
  processChatFile,
  uploadController.uploadChatAttachment
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