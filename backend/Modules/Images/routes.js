const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('./controller');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Routes
router.post('/upload', upload.single('image'), controller.uploadImage);
router.get('/', controller.getAllImages);
router.get('/:fileName', controller.getImageByFileName);
router.delete('/:fileName', controller.deleteImage);

module.exports = router;
