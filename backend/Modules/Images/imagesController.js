const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {ImagesModel} = require('./imagesModel');

// Directory to store uploaded images
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/images');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

class ImagesController {
  /**
   * Upload an image
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  uploadImage = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      // Get user ID from request
      const userId = req.body.userId || req.user?.id;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // Verificar que el usuario existe
      try {
        const { Usuarios } = require('../../db/schema');
        const user = await Usuarios.findByPk(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // Verificar que el usuario es administrador
        if (user.admin !== 1) {
          return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        console.log(`Usuario autenticado: ${user.username} (ID: ${userId})`);
      } catch (error) {
        console.error('Error verificando usuario:', error);
        return res.status(500).json({ message: 'Error verifying user' });
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
        console.log('Dimensiones obtenidas con image-size:', dimensions);
      } catch (err) {
        console.error('Error getting image dimensions with image-size:', err);
        // Fallback: usar las dimensiones del request si están disponibles
        if (req.body.originalWidth && req.body.originalHeight) {
          dimensions = {
            width: parseInt(req.body.originalWidth),
            height: parseInt(req.body.originalHeight)
          };
          console.log('Usando dimensiones del request como fallback:', dimensions);
        }
      }

      // Check if this is a cropped image
      const isCropped = req.body.isCropped === 'true';
      let cropData = null;
      
      try {
        if (req.body.cropData) {
          cropData = JSON.parse(req.body.cropData);
          console.log('Datos de recorte recibidos:', cropData);
        }
      } catch (error) {
        console.error('Error parsing crop data:', error);
      }

      // Get original dimensions from request or calculated
      const originalWidth = parseInt(req.body.originalWidth) || dimensions.width || 0;
      const originalHeight = parseInt(req.body.originalHeight) || dimensions.height || 0;

      // Always store image characteristics (either from crop or original)
      const imageCharacteristics = {
        originalWidth: originalWidth,
        originalHeight: originalHeight,
        originalSize: req.file.size,
        originalMimeType: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      };

      // If cropped, add crop data; if not, store original characteristics
      if (isCropped && cropData) {
        imageCharacteristics.cropData = cropData;
        // Para imágenes recortadas, usar las dimensiones del recorte
        imageCharacteristics.finalWidth = Math.round(cropData.width) || originalWidth || 0;
        imageCharacteristics.finalHeight = Math.round(cropData.height) || originalHeight || 0;
        imageCharacteristics.isCropped = true;
        console.log('✂️ Imagen recortada - dimensiones finales:', imageCharacteristics.finalWidth, 'x', imageCharacteristics.finalHeight);
        console.log('📊 Datos de recorte guardados:', JSON.stringify(cropData, null, 2));
      } else if (isCropped) {
        // Si está marcada como recortada pero no hay datos, usar dimensiones del archivo
        imageCharacteristics.finalWidth = originalWidth || 0;
        imageCharacteristics.finalHeight = originalHeight || 0;
        imageCharacteristics.isCropped = true;
        console.log('⚠️ Imagen marcada como recortada sin datos específicos - usando dimensiones del archivo:', imageCharacteristics.finalWidth, 'x', imageCharacteristics.finalHeight);
      } else {
        // Para imágenes no recortadas, usar las dimensiones originales
        imageCharacteristics.finalWidth = originalWidth || 0;
        imageCharacteristics.finalHeight = originalHeight || 0;
        imageCharacteristics.isCropped = false;
        console.log('📷 Imagen original - dimensiones:', imageCharacteristics.finalWidth, 'x', imageCharacteristics.finalHeight);
      }

      // Guardar también las dimensiones originales para referencia
      imageCharacteristics.originalWidth = originalWidth;
      imageCharacteristics.originalHeight = originalHeight;

      // Asegurar que las dimensiones no sean 0
      if (imageCharacteristics.finalWidth === 0 || imageCharacteristics.finalHeight === 0) {
        console.warn('⚠️ Dimensiones 0 detectadas, usando valores por defecto');
        imageCharacteristics.finalWidth = imageCharacteristics.finalWidth || 800;
        imageCharacteristics.finalHeight = imageCharacteristics.finalHeight || 600;
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
   * Get all images for a user with optional selection filter
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUserImages = async (req, res) => {
    try {
      const { userId, selected } = req.query;
      const userIdToUse = userId || req.user?.id || 1;
      const images = await ImagesModel.getImagesByUser(
        userIdToUse, 
        selected ? parseInt(selected) : null
      );
      
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
  getImageById = async (req, res) => {
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
  updateImage = async (req, res) => {
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
  deleteImage = async (req, res) => {
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
   * Set image selection status (supports multi-selection)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  setImageSelection = async (req, res) => {
    try {
      const { imageId } = req.params;
      const { userId, selected } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const image = await ImagesModel.getImageById(imageId);
      if (!image) {
        return res.status(404).json({ message: 'Image not found' });
      }
      
      // Verify image belongs to user
      if (image.id_usuario !== parseInt(userId)) {
        return res.status(403).json({ message: 'Access denied. Image does not belong to user.' });
      }
      
      const selectionValue = selected !== undefined ? selected : 1;
      
      // Update the image selection status
      const updatedImage = await ImagesModel.updateImage(imageId, { seleccionada: selectionValue });
      
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
        message: 'Image selection updated successfully',
        image: formattedImage 
      });
    } catch (error) {
      console.error('Error setting image selection:', error);
      return res.status(500).json({ message: 'Failed to set image selection', error: error.message });
    }
  };

  /**
   * Get selected image for user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getSelectedImage = async (req, res) => {
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
}
module.exports = { ImagesController };
