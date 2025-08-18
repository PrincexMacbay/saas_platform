const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;

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

    // Update req.file with processed file info
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

    // Update req.file with processed file info
    req.file.path = outputPath;
    req.file.filename = 'profile-' + req.file.filename;

    next();
  } catch (error) {
    console.error('Profile image processing error:', error);
    next();
  }
};

module.exports = {
  upload,
  uploadDocument,
  processImage,
  processProfileImage,
};