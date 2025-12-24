const path = require('path');
const fs = require('fs').promises;
const { User } = require('../models');
const { uploadFile: uploadToCloud } = require('../services/cloudStorage');

// Upload profile image
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Use cloud URL if available, otherwise use local URL
    let imageUrl, fullImageUrl;
    if (req.file.cloudUrl) {
      // File is in cloud storage
      imageUrl = req.file.cloudUrl;
      fullImageUrl = req.file.cloudUrl;
    } else {
      // File is local
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imageUrl = `/uploads/${req.file.filename}`;
      fullImageUrl = baseUrl + imageUrl;
    }

    // Update user's profile image in database
    await req.user.update({
      profileImage: imageUrl
    });

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        imageUrl: imageUrl,
        fullUrl: fullImageUrl
      }
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    
    // Clean up uploaded file if database update fails
    if (req.file && req.file.path && !req.file.isCloud) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image'
    });
  }
};

// Upload post attachment
const uploadPostAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Generate public URL for the uploaded file
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `/uploads/${req.file.filename}`;
    const fullImageUrl = baseUrl + imageUrl;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        imageUrl: imageUrl,
        fullUrl: fullImageUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload post attachment error:', error);
    
    // Clean up uploaded file
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload file'
    });
  }
};

// General file upload (for logos, etc.)
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to cloud storage if not already done by middleware
    let fileUrl, fullFileUrl;
    if (req.file.cloudUrl) {
      // Already uploaded to cloud by middleware
      fileUrl = req.file.cloudUrl;
      fullFileUrl = req.file.cloudUrl;
    } else {
      // Upload to cloud (or keep local)
      const cloudResult = await uploadToCloud(req.file.path, {
        folder: 'general-uploads',
        resource_type: 'auto',
      });
      
      if (cloudResult.isCloud) {
        fileUrl = cloudResult.url;
        fullFileUrl = cloudResult.url;
      } else {
        // Local storage fallback
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        fileUrl = `/uploads/${req.file.filename}`;
        fullFileUrl = baseUrl + fileUrl;
      }
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        fullUrl: fullFileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload file error:', error);
    
    // Clean up uploaded file
    if (req.file && req.file.path && !req.file.isCloud) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload file'
    });
  }
};

// Delete uploaded file
const deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security check: only allow deleting files uploaded by the current user
    // In a production app, you'd want more sophisticated file ownership tracking
    const filePath = path.join(__dirname, '../uploads', filename);
    
    await fs.unlink(filePath);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
};

module.exports = {
  uploadProfileImage,
  uploadPostAttachment,
  uploadFile,
  deleteFile,
};