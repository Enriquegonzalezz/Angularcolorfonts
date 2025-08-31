const { Imagenes, Usuarios } = require('../../db/schema');
const { Op } = require('sequelize');

class ImagesModel {
  /**
   * Crear una nueva imagen en la base de datos
   * @param {Object} imageData - Datos de la imagen
   * @returns {Promise<Object>} Imagen creada
   */
  static async createImage(imageData) {
    try {
      const image = await Imagenes.create(imageData);
      return image;
    } catch (error) {
      throw new Error(`Error al crear imagen: ${error.message}`);
    }
  }

  /**
   * Obtener todas las imágenes de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de imágenes
   */
  static async getImagesByUser(userId) {
    try {
      const images = await Imagenes.findAll({
        where: { id_usuario: userId },
        order: [['fecha_creacion', 'DESC']]
      });
      return images;
    } catch (error) {
      throw new Error(`Error al obtener imágenes: ${error.message}`);
    }
  }

  /**
   * Obtener una imagen por ID
   * @param {number} imageId - ID de la imagen
   * @returns {Promise<Object>} Imagen encontrada
   */
  static async getImageById(imageId) {
    try {
      const image = await Imagenes.findByPk(imageId);
      return image;
    } catch (error) {
      throw new Error(`Error al obtener imagen: ${error.message}`);
    }
  }

  /**
   * Actualizar una imagen
   * @param {number} imageId - ID de la imagen
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Imagen actualizada
   */
  static async updateImage(imageId, updateData) {
    try {
      const image = await Imagenes.findByPk(imageId);
      if (!image) {
        throw new Error('Imagen no encontrada');
      }
      
      await image.update(updateData);
      return image;
    } catch (error) {
      throw new Error(`Error al actualizar imagen: ${error.message}`);
    }
  }

  /**
   * Eliminar una imagen
   * @param {number} imageId - ID de la imagen
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  static async deleteImage(imageId) {
    try {
      const image = await Imagenes.findByPk(imageId);
      if (!image) {
        throw new Error('Imagen no encontrada');
      }
      
      await image.destroy();
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar imagen: ${error.message}`);
    }
  }

  /**
   * Deseleccionar todas las imágenes de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<boolean>} True si se actualizó correctamente
   */
  static async deselectAllUserImages(userId) {
    try {
      await Imagenes.update(
        { seleccionada: 0 },
        { where: { id_usuario: userId } }
      );
      return true;
    } catch (error) {
      throw new Error(`Error al deseleccionar imágenes: ${error.message}`);
    }
  }

  /**
   * Marcar una imagen como seleccionada
   * @param {number} imageId - ID de la imagen
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Imagen actualizada
   */
  static async selectImage(imageId, userId) {
    try {
      // Primero desmarcar todas las imágenes del usuario
      await this.deselectAllUserImages(userId);

      // Marcar la imagen seleccionada
      const image = await Imagenes.findByPk(imageId);
      if (!image) {
        throw new Error('Imagen no encontrada');
      }

      await image.update({ seleccionada: 1 });
      return image;
    } catch (error) {
      throw new Error(`Error al seleccionar imagen: ${error.message}`);
    }
  }

  /**
   * Obtener la imagen seleccionada de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Imagen seleccionada
   */
  static async getSelectedImage(userId) {
    try {
      const image = await Imagenes.findOne({
        where: { 
          id_usuario: userId,
          seleccionada: 1
        }
      });
      return image;
    } catch (error) {
      throw new Error(`Error al obtener imagen seleccionada: ${error.message}`);
    }
  }
}

module.exports = ImagesModel;
