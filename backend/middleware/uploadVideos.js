const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for videos
const videoFileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    // Accept video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for video upload!'), false);
    }
  } else {
    cb(new Error('Unexpected field name!'), false);
  }
};

// File filter for audio files
const audioFileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio') {
    // Accept audio files (specifically MP3)
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
      cb(null, true);
    } else {
      cb(new Error('Only audio files (MP3) are allowed for audio upload!'), false);
    }
  } else {
    cb(new Error('Unexpected field name!'), false);
  }
};

// File filter for subtitle files (VTT)
const subtitleFileFilter = (req, file, cb) => {
  if (file.fieldname === 'subtitle') {
    // Accept VTT files
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (fileExtension === '.vtt' || file.mimetype === 'text/vtt') {
      cb(null, true);
    } else {
      cb(new Error('Only VTT subtitle files are allowed!'), false);
    }
  } else {
    cb(new Error('Unexpected field name!'), false);
  }
};

// Combined file filter for mixed uploads
const combinedFileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for video field!'), false);
    }
  } else if (file.fieldname === 'audio') {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed for audio field!'), false);
    }
  } else if (file.fieldname === 'subtitle') {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (fileExtension === '.vtt' || file.mimetype === 'text/vtt') {
      cb(null, true);
    } else {
      cb(new Error('Only VTT subtitle files are allowed for subtitle field!'), false);
    }
  } else {
    cb(new Error('Unexpected field name!'), false);
  }
};

// Video upload middleware
const uploadVideo = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for videos
  },
  fileFilter: videoFileFilter
});

// Audio upload middleware
const uploadAudio = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for audio files
  },
  fileFilter: audioFileFilter
});

// Subtitle upload middleware
const uploadSubtitle = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for subtitle files
  },
  fileFilter: subtitleFileFilter
});

// Combined upload middleware for multiple file types
const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit (for videos)
  },
  fileFilter: combinedFileFilter
});

// Error handling middleware
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large',
        error: 'The uploaded file exceeds the maximum allowed size'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected file field',
        error: 'The file field name is not expected'
      });
    }
    return res.status(400).json({
      message: 'File upload error',
      error: error.message
    });
  }
  
  if (error.message.includes('Only') || error.message.includes('Unexpected')) {
    return res.status(400).json({
      message: 'Invalid file type',
      error: error.message
    });
  }
  
  next(error);
};

module.exports = {
  uploadVideo,
  uploadAudio,
  uploadSubtitle,
  uploadMultiple,
  handleMulterError
};