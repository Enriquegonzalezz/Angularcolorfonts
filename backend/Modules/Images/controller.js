const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ImagesModel = require('./imagesModel');

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

    // Get user ID from request (assuming it's passed in the request)
    const userId = req.body.userId || req.user?.id || 1; // Default to 1 for testing

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

    // Check if this is a cropped image
    const isCropped = req.body.isCropped === 'true';
    const cropData = req.body.cropData ? JSON.parse(req.body.cropData) : null;

    // Always store image characteristics (either from crop or original)
    const imageCharacteristics = {
      originalWidth: dimensions.width || 0,
      originalHeight: dimensions.height || 0,
      originalSize: req.file.size,
      originalMimeType: req.file.mimetype
    };

    // If cropped, add crop data; if not, store original characteristics
    if (isCropped && cropData) {
      imageCharacteristics.cropData = cropData;
      imageCharacteristics.finalWidth = cropData.width || dimensions.width || 0;
      imageCharacteristics.finalHeight = cropData.height || dimensions.height || 0;
    } else {
      imageCharacteristics.finalWidth = dimensions.width || 0;
      imageCharacteristics.finalHeight = dimensions.height || 0;
    }

    // Create image record in database
    const imageData = {
      id_usuario: userId,
      imagen_url: `/uploads/images/${fileName}`,
      nombre_original: req.file.originalname,
      nombre_archivo: fileName,
      tamano: req.file.size,
      ancho: imageCharacteristics.finalWidth,
      alto: imageCharacteristics.finalHeight,
      tipo_mime: req.file.mimetype,
      es_recortada: isCropped ? 1 : 0,
      datos_recorte: JSON.stringify(imageCharacteristics),
      seleccionada: 0,
      fecha_creacion: new Date()
    };

    // Save to database
    const savedImage = await ImagesModel.createImage(imageData);

    // Return image data
    return res.status(201).json({
      message: 'Image uploaded successfully',
      image: {
        id: savedImage.id,
        imageUrl: savedImage.imagen_url,
        originalName: savedImage.nombre_original,
        fileName: savedImage.nombre_archivo,
        size: savedImage.tamano,
        width: savedImage.ancho,
        height: savedImage.alto,
        mimeType: savedImage.tipo_mime,
        isCropped: savedImage.es_recortada === 1,
        characteristics: JSON.parse(savedImage.datos_recorte),
        selected: savedImage.seleccionada === 1,
        createdAt: savedImage.fecha_creacion
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
};

/**
 * Get all images for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserImages = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id || 1;
    const images = await ImagesModel.getImagesByUser(userId);
    
    const formattedImages = images.map(img => ({
      id: img.id,
      imageUrl: img.imagen_url,
      originalName: img.nombre_original,
      fileName: img.nombre_archivo,
      size: img.tamano,
      width: img.ancho,
      height: img.alto,
      mimeType: img.tipo_mime,
      isCropped: img.es_recortada === 1,
      characteristics: img.datos_recorte ? JSON.parse(img.datos_recorte) : null,
      selected: img.seleccionada === 1,
      createdAt: img.fecha_creacion
    }));
    
    return res.status(200).json({ images: formattedImages });
  } catch (error) {
    console.error('Error getting user images:', error);
    return res.status(500).json({ message: 'Failed to get images', error: error.message });
  }
};

/**
 * Get image by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getImageById = async (req, res) => {
  try {
    const { imageId } = req.params;
    const image = await ImagesModel.getImageById(imageId);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    const formattedImage = {
      id: image.id,
      imageUrl: image.imagen_url,
      originalName: image.nombre_original,
      fileName: image.nombre_archivo,
      size: image.tamano,
      width: image.ancho,
      height: image.alto,
      mimeType: image.tipo_mime,
      isCropped: image.es_recortada === 1,
      characteristics: image.datos_recorte ? JSON.parse(image.datos_recorte) : null,
      selected: image.seleccionada === 1,
      createdAt: image.fecha_creacion
    };
    
    return res.status(200).json({ image: formattedImage });
  } catch (error) {
    console.error('Error getting image:', error);
    return res.status(500).json({ message: 'Failed to get image', error: error.message });
  }
};

/**
 * Update image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const updateData = req.body;
    
    const updatedImage = await ImagesModel.updateImage(imageId, updateData);
    
    const formattedImage = {
      id: updatedImage.id,
      imageUrl: updatedImage.imagen_url,
      originalName: updatedImage.nombre_original,
      fileName: updatedImage.nombre_archivo,
      size: updatedImage.tamano,
      width: updatedImage.ancho,
      height: updatedImage.alto,
      mimeType: updatedImage.tipo_mime,
      isCropped: updatedImage.es_recortada === 1,
      characteristics: updatedImage.datos_recorte ? JSON.parse(updatedImage.datos_recorte) : null,
      selected: updatedImage.seleccionada === 1,
      createdAt: updatedImage.fecha_creacion
    };
    
    return res.status(200).json({ 
      message: 'Image updated successfully',
      image: formattedImage 
    });
  } catch (error) {
    console.error('Error updating image:', error);
    return res.status(500).json({ message: 'Failed to update image', error: error.message });
  }
};

/**
 * Delete image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    // Get image info before deleting
    const image = await ImagesModel.getImageById(imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Delete file from disk
    const filePath = path.join(__dirname, '../../public', image.imagen_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database
    await ImagesModel.deleteImage(imageId);
    
    return res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
};

/**
 * Toggle image selection for user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const toggleImageSelection = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.body.userId || req.user?.id || 1;
    
    const image = await ImagesModel.getImageById(imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // If image is already selected, deselect it; otherwise, select it
    const newSelectionStatus = image.seleccionada === 1 ? 0 : 1;
    
    if (newSelectionStatus === 1) {
      // First deselect all other images for this user
      await ImagesModel.deselectAllUserImages(userId);
    }
    
    // Update the image selection status
    const updatedImage = await ImagesModel.updateImage(imageId, { seleccionada: newSelectionStatus });
    
    const formattedImage = {
      id: updatedImage.id,
      imageUrl: updatedImage.imagen_url,
      originalName: updatedImage.nombre_original,
      fileName: updatedImage.nombre_archivo,
      size: updatedImage.tamano,
      width: updatedImage.ancho,
      height: updatedImage.alto,
      mimeType: updatedImage.tipo_mime,
      isCropped: updatedImage.es_recortada === 1,
      characteristics: updatedImage.datos_recorte ? JSON.parse(updatedImage.datos_recorte) : null,
      selected: updatedImage.seleccionada === 1,
      createdAt: updatedImage.fecha_creacion
    };
    
    return res.status(200).json({ 
      message: `Image ${newSelectionStatus === 1 ? 'selected' : 'deselected'} successfully`,
      image: formattedImage 
    });
  } catch (error) {
    console.error('Error toggling image selection:', error);
    return res.status(500).json({ message: 'Failed to toggle image selection', error: error.message });
  }
};

/**
 * Get selected image for user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSelectedImage = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id || 1;
    const image = await ImagesModel.getSelectedImage(userId);
    
    if (!image) {
      return res.status(404).json({ message: 'No selected image found' });
    }
    
    const formattedImage = {
      id: image.id,
      imageUrl: image.imagen_url,
      originalName: image.nombre_original,
      fileName: image.nombre_archivo,
      size: image.tamano,
      width: image.ancho,
      height: image.alto,
      mimeType: image.tipo_mime,
      isCropped: image.es_recortada === 1,
      characteristics: image.datos_recorte ? JSON.parse(image.datos_recorte) : null,
      selected: image.seleccionada === 1,
      createdAt: image.fecha_creacion
    };
    
    return res.status(200).json({ image: formattedImage });
  } catch (error) {
    console.error('Error getting selected image:', error);
    return res.status(500).json({ message: 'Failed to get selected image', error: error.message });
  }
};

module.exports = {
  uploadImage,
  getUserImages,
  getImageById,
  updateImage,
  deleteImage,
  toggleImageSelection,
  getSelectedImage
};
