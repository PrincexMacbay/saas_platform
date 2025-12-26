const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;
const { uploadFile: uploadToCloud } = require('../services/cloudStorage');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function for images
const imageFilter = (req, file, cb) => {
  // Allow images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// File filter function for chat messages (images, videos, files)
const chatFileFilter = (req, file, cb) => {
  // Allow images, videos, and common file types
  const allowedMimeTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype) || 
      file.mimetype.startsWith('image/') || 
      file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed!'), false);
  }
};

// File filter function for documents
const documentFilter = (req, file, cb) => {
  // Allow PDF, DOC, DOCX files
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed!'), false);
  }
};

// Configure multer for images
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: imageFilter
});

// Configure multer for documents
const uploadDocument = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: documentFilter
});

// Image processing middleware
const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const inputPath = req.file.path;
    const outputPath = path.join(
      path.dirname(inputPath),
      'processed-' + req.file.filename
    );

    // Process image with sharp
    await sharp(inputPath)
      .resize(800, 600, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    // Delete original file
    await fs.unlink(inputPath);

    // Upload to cloud storage (or keep local)
    // Determine folder based on request context (post attachment vs logo)
    const folder = req.originalUrl?.includes('logo') || req.body?.type === 'logo' 
      ? 'logos' 
      : 'post-attachments';
    
    console.log('📤 Processing image, uploading to cloud...', { folder });
    const cloudResult = await uploadToCloud(outputPath, {
      folder,
      resource_type: 'image',
      transformation: {
        quality: 'auto',
        fetch_format: 'auto',
      },
    });

    console.log('📤 Cloud upload result:', {
      isCloud: cloudResult.isCloud,
      url: cloudResult.url?.substring(0, 50) + '...',
    });

    // Update req.file with cloud URL or local path
    req.file.cloudUrl = cloudResult.url;
    req.file.isCloud = cloudResult.isCloud;
    req.file.publicId = cloudResult.publicId;
    req.file.path = outputPath;
    req.file.filename = 'processed-' + req.file.filename;

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    // If processing fails, continue with original file
    next();
  }
};

// Profile image processing (smaller size)
const processProfileImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const inputPath = req.file.path;
    const outputPath = path.join(
      path.dirname(inputPath),
      'profile-' + req.file.filename
    );

    // Process profile image (smaller, square)
    await sharp(inputPath)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    // Delete original file
    await fs.unlink(inputPath);

    // Upload to cloud storage (or keep local)
    console.log('📤 Processing profile image, uploading to cloud...');
    const cloudResult = await uploadToCloud(outputPath, {
      folder: 'profile-images',
      resource_type: 'image',
      transformation: {
        width: 200,
        height: 200,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'auto',
      },
    });

    console.log('📤 Profile image cloud upload result:', {
      isCloud: cloudResult.isCloud,
      url: cloudResult.url?.substring(0, 50) + '...',
    });

    // Update req.file with cloud URL or local path
    req.file.cloudUrl = cloudResult.url;
    req.file.isCloud = cloudResult.isCloud;
    req.file.publicId = cloudResult.publicId;
    req.file.path = outputPath;
    req.file.filename = 'profile-' + req.file.filename;

    next();
  } catch (error) {
    console.error('Profile image processing error:', error);
    next();
  }
};

// Configure multer for chat files (images, videos, documents)
const uploadChatFile = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 25 * 1024 * 1024, // 25MB default for chat
  },
  fileFilter: chatFileFilter
});

// Process chat file (images get processed, videos/files are uploaded as-is)
const processChatFile = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const isImage = req.file.mimetype.startsWith('image/');
    const isVideo = req.file.mimetype.startsWith('video/');

    if (isImage) {
      // Process images with sharp
      const inputPath = req.file.path;
      const outputPath = path.join(
        path.dirname(inputPath),
        'processed-' + req.file.filename
      );

      await sharp(inputPath)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath);

      await fs.unlink(inputPath);

      // Upload to cloud
      const cloudResult = await uploadToCloud(outputPath, {
        folder: 'chat-attachments',
        resource_type: 'image',
        transformation: {
          quality: 'auto',
          fetch_format: 'auto',
        },
      });

      req.file.cloudUrl = cloudResult.url;
      req.file.isCloud = cloudResult.isCloud;
      req.file.publicId = cloudResult.publicId;
      req.file.path = outputPath;
      req.file.filename = 'processed-' + req.file.filename;
    } else {
      // For videos and files, upload directly to cloud
      const resourceType = isVideo ? 'video' : 'raw';
      const cloudResult = await uploadToCloud(req.file.path, {
        folder: 'chat-attachments',
        resource_type: resourceType,
      });

      req.file.cloudUrl = cloudResult.url;
      req.file.isCloud = cloudResult.isCloud;
      req.file.publicId = cloudResult.publicId;
    }

    next();
  } catch (error) {
    console.error('Chat file processing error:', error);
    next();
  }
};

module.exports = {
  upload,
  uploadDocument,
  uploadChatFile,
  processImage,
  processProfileImage,
  processChatFile,
};