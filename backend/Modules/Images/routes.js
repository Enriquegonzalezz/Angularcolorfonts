const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  uploadImage, 
  getUserImages, 
  getImageById, 
  updateImage, 
  deleteImage, 
  toggleImageSelection, 
  getSelectedImage 
} = require('./controller');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Upload image
router.post('/upload', upload.single('image'), uploadImage);

// Get all images for a user
router.get('/user/:userId', getUserImages);

// Get image by ID
router.get('/:imageId', getImageById);

// Update image
router.put('/:imageId', updateImage);

// Delete image
router.delete('/:imageId', deleteImage);

// Toggle image selection for user
router.post('/:imageId/toggle-selection', toggleImageSelection);

// Get selected image for user
router.get('/user/:userId/selected', getSelectedImage);

module.exports = router;
