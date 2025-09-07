const { Router } = require('express');
const {ImagesController} = require('./imagesController');

const multer = require('multer');

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
const createImagesRouter = () => {
  const imagesRouter = Router();
  const imagesController = new ImagesController();
  // Upload image
  imagesRouter.post('/upload', upload.single('image'), imagesController.uploadImage);

  // Get all images for a user
  imagesRouter.get('/user/:userId', imagesController.getUserImages);

  // Get image by ID
  imagesRouter.get('/:imageId', imagesController.getImageById);

  // Update image
  imagesRouter.put('/:imageId', imagesController.updateImage);

  // Delete image
  imagesRouter.delete('/:imageId', imagesController.deleteImage);

  // Toggle image selection for user
  imagesRouter.post('/:imageId/toggle-selection', imagesController.toggleImageSelection);

  // Get selected image for user
  imagesRouter.get('/user/:userId/selected', imagesController.getSelectedImage);
  return imagesRouter;
}
module.exports = {createImagesRouter};
