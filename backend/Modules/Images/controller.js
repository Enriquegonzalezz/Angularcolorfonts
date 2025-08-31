const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Directory to store uploaded images
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/images');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Upload an image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Write file to disk
    fs.writeFileSync(filePath, req.file.buffer);

    // Get image dimensions using image-size package if available
    let dimensions = { width: 0, height: 0 };
    try {
      const sizeOf = require('image-size');
      dimensions = sizeOf(filePath);
    } catch (err) {
      console.error('Error getting image dimensions:', err);
    }

    // Create image record
    const imageData = {
      id: uuidv4(),
      fileName,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      width: dimensions.width || 0,
      height: dimensions.height || 0,
      path: `/uploads/images/${fileName}`,
      createdAt: new Date()
    };

    // Return image data
    return res.status(201).json({
      message: 'Image uploaded successfully',
      image: imageData
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
};

/**
 * Get all images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllImages = async (req, res) => {
  try {
    // Read directory and get all image files
    const files = fs.readdirSync(UPLOAD_DIR);
    
    const images = files.map(file => {
      const filePath = path.join(UPLOAD_DIR, file);
      const stats = fs.statSync(filePath);
      
      // Get image dimensions
      let dimensions = { width: 0, height: 0 };
      try {
        const sizeOf = require('image-size');
        dimensions = sizeOf(filePath);
      } catch (err) {
        console.error('Error getting image dimensions:', err);
      }
      
      return {
        fileName: file,
        size: stats.size,
        width: dimensions.width || 0,
        height: dimensions.height || 0,
        path: `/uploads/images/${file}`,
        createdAt: stats.ctime
      };
    });
    
    return res.status(200).json({ images });
  } catch (error) {
    console.error('Error getting images:', error);
    return res.status(500).json({ message: 'Failed to get images', error: error.message });
  }
};

/**
 * Get image by filename
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getImageByFileName = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    const stats = fs.statSync(filePath);
    
    // Get image dimensions
    let dimensions = { width: 0, height: 0 };
    try {
      const sizeOf = require('image-size');
      dimensions = sizeOf(filePath);
    } catch (err) {
      console.error('Error getting image dimensions:', err);
    }
    
    const imageData = {
      fileName,
      size: stats.size,
      width: dimensions.width || 0,
      height: dimensions.height || 0,
      path: `/uploads/images/${fileName}`,
      createdAt: stats.ctime
    };
    
    return res.status(200).json({ image: imageData });
  } catch (error) {
    console.error('Error getting image:', error);
    return res.status(500).json({ message: 'Failed to get image', error: error.message });
  }
};

/**
 * Delete image by filename
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteImage = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Delete file
    fs.unlinkSync(filePath);
    
    return res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
};

module.exports = {
  uploadImage,
  getAllImages,
  getImageByFileName,
  deleteImage
};
