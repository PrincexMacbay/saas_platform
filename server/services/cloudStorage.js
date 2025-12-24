const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;
const path = require('path');

// Configure Cloudinary (only if credentials are provided)
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configured for cloud storage');
} else {
  console.log('⚠️ Cloudinary not configured - using local storage (files will be lost on server restart)');
  console.log('   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to enable cloud storage');
}

/**
 * Upload file to Cloudinary or return local path
 * @param {string} filePath - Path to the local file
 * @param {Object} options - Upload options
 * @param {string} options.folder - Folder name in Cloudinary
 * @param {string} options.resource_type - Resource type (image, raw, etc.)
 * @param {Object} options.transformation - Image transformation options
 * @returns {Promise<{url: string, publicId: string|null, isCloud: boolean}>}
 */
const uploadFile = async (filePath, options = {}) => {
  const {
    folder = 'uploads',
    resource_type = 'auto',
    transformation = {},
  } = options;

  // If Cloudinary is not configured, return local path (relative)
  // Controllers will construct the full URL using request context
  if (!isCloudinaryConfigured) {
    const filename = path.basename(filePath);
    return {
      url: `/uploads/${filename}`, // Relative path - controllers will add base URL
      publicId: null,
      isCloud: false,
    };
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type,
      transformation,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    // Delete local file after successful upload
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Failed to delete local file after cloud upload:', error.message);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      isCloud: true,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Fallback to local storage if cloud upload fails
    const filename = path.basename(filePath);
    const baseUrl = process.env.API_URL || process.env.BACKEND_URL || 'http://localhost:5000';
    return {
      url: `${baseUrl}/uploads/${filename}`,
      publicId: null,
      isCloud: false,
    };
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<boolean>}
 */
const deleteFile = async (publicId) => {
  if (!isCloudinaryConfigured || !publicId) {
    return false;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

/**
 * Delete local file
 * @param {string} filePath - Path to the local file
 * @returns {Promise<boolean>}
 */
const deleteLocalFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Local file delete error:', error);
    return false;
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  deleteLocalFile,
  isCloudinaryConfigured,
};
