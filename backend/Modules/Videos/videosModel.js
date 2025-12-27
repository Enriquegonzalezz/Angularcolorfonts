const { Videos, Colores, Fuentes } = require('../../db/schema');
const { Op } = require('sequelize');

class VideosModel {
  /**
   * Create a new video record in the database
   * @param {Object} videoData - Video data to save
   * @returns {Promise<Object>} Created video record
   */
  async createVideo(videoData) {
    try {
      const video = await Videos.create({
        id_usuario: videoData.id_usuario,
        video_url: videoData.video_url,
        nombre_original: videoData.nombre_original,
        nombre_archivo: videoData.nombre_archivo,
        tamano: videoData.tamano,
        extension: videoData.extension,
        duracion: videoData.duracion,
        nombre_subtitulo_1: videoData.nombre_subtitulo_1 || null,
        nombre_subtitulo_2: videoData.nombre_subtitulo_2 || null,
        nombre_audio_1: videoData.nombre_audio_1 || null,
        nombre_audio_2: videoData.nombre_audio_2 || null,
        seleccionada: videoData.seleccionada || 0
      });
      return video;
    } catch (error) {
      throw new Error(`Error creating video: ${error.message}`);
    }
  }

  /**
   * Get videos by user ID with optional selection filter
   * @param {number} userId - User ID
   * @param {number} selected - Selection filter (0 or 1, null for all)
   * @returns {Promise<Array>} Array of video records
   */
  async getVideosByUser(userId, selected = null) {
    try {
      const whereClause = { id_usuario: userId };
      
      if (selected !== null) {
        whereClause.seleccionada = selected;
      }
      
      const videos = await Videos.findAll({
        where: whereClause,
        order: [['id', 'DESC']]
      });
      return videos;
    } catch (error) {
      throw new Error(`Error getting videos by user: ${error.message}`);
    }
  }

  /**
   * Get all videos (admin function)
   * @returns {Promise<Array>} Array of all video records
   */
  async getAllVideos() {
    try {
      const videos = await Videos.findAll({
        order: [['id', 'DESC']]
      });
      return videos;
    } catch (error) {
      throw new Error(`Error fetching all videos: ${error.message}`);
    }
  }

  /**
   * Get video by ID
   * @param {number} videoId - Video ID
   * @returns {Promise<Object|null>} Video record or null
   */
  async getVideoById(videoId) {
    try {
      const video = await Videos.findByPk(videoId);
      return video;
    } catch (error) {
      throw new Error(`Error fetching video: ${error.message}`);
    }
  }

  /**
   * Get video by filename
   * @param {string} filename - Video filename
   * @returns {Promise<Object|null>} Video record or null
   */
  async getVideoByFilename(filename) {
    try {
      const video = await Videos.findOne({
        where: { nombre_archivo: filename }
      });
      return video;
    } catch (error) {
      throw new Error(`Error fetching video by filename: ${error.message}`);
    }
  }

  /**
   * Update video record
   * @param {number} videoId - Video ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated video record
   */
  async updateVideo(videoId, updateData) {
    try {
      const video = await Videos.findByPk(videoId);
      if (!video) {
        throw new Error('Video not found');
      }

      await video.update(updateData);
      return video;
    } catch (error) {
      throw new Error(`Error updating video: ${error.message}`);
    }
  }

  /**
   * Update subtitle files for a video
   * @param {number} videoId - Video ID
   * @param {string} language - Language ('es' or 'en')
   * @param {string} filename - Subtitle filename
   * @returns {Promise<Object>} Updated video record
   */
  async updateSubtitle(videoId, language, filename) {
    try {
      const video = await Videos.findByPk(videoId);
      if (!video) {
        throw new Error('Video not found');
      }

      const updateData = {};
      if (language === 'es' || language === 'spanish') {
        updateData.nombre_subtitulo_1 = filename;
      } else if (language === 'en' || language === 'english') {
        updateData.nombre_subtitulo_2 = filename;
      } else {
        throw new Error('Invalid language. Use "es" for Spanish or "en" for English');
      }

      await video.update(updateData);
      return video;
    } catch (error) {
      throw new Error(`Error updating subtitle: ${error.message}`);
    }
  }

  /**
   * Update audio files for a video
   * @param {number} videoId - Video ID
   * @param {string} language - Language ('es' or 'en')
   * @param {string} filename - Audio filename
   * @returns {Promise<Object>} Updated video record
   */
  async updateAudio(videoId, language, filename) {
    try {
      const video = await Videos.findByPk(videoId);
      if (!video) {
        throw new Error('Video not found');
      }

      const updateData = {};
      if (language === 'es' || language === 'spanish') {
        updateData.nombre_audio_1 = filename;
      } else if (language === 'en' || language === 'english') {
        updateData.nombre_audio_2 = filename;
      } else {
        throw new Error('Invalid language. Use "es" for Spanish or "en" for English');
      }

      await video.update(updateData);
      return video;
    } catch (error) {
      throw new Error(`Error updating audio: ${error.message}`);
    }
  }

  /**
   * Update subtitle styling
   * @param {number} videoId - Video ID
   * @param {string} textColor - Text color
   * @param {string} backgroundColor - Background color
   * @param {string} fontSize - Font size
   * @param {string} fontFile - Font file name
   * @returns {Promise<Object>} Updated video record
   */
  async updateSubtitleStyling(videoId, textColor, backgroundColor, fontSize, fontFile) {
    try {
      const video = await Videos.findByPk(videoId);
      if (!video) {
        throw new Error('Video not found');
      }

      const updateData = {};
      if (textColor !== null) updateData.color_letra_subtitulo = textColor;
      if (backgroundColor !== null) updateData.fondo_subtitulo = backgroundColor;
      if (fontSize !== null) updateData.tamano_subtitulo = fontSize;
      if (fontFile !== null) updateData.tipografia_subtitulo = fontFile;

      await video.update(updateData);
      return video;
    } catch (error) {
      throw new Error(`Error updating subtitle styling: ${error.message}`);
    }
  }

  /**
   * Set video selection status (allows multiple selections)
   * @param {number} videoId - Video ID
   * @param {number} userId - User ID
   * @param {number} selected - Selection status (0 or 1)
   * @returns {Promise<Object>} Updated video record
   */
  async setSelectedVideo(videoId, userId, selected = 1) {
    try {
      const [affectedRows] = await Videos.update(
        { seleccionada: selected },
        { 
          where: { 
            id: videoId,
            id_usuario: userId 
          } 
        }
      );

      if (affectedRows === 0) {
        throw new Error('Video not found or does not belong to user');
      }

      // Return the updated video
      const updatedVideo = await Videos.findOne({
        where: { id: videoId, id_usuario: userId }
      });

      return updatedVideo;
    } catch (error) {
      throw new Error(`Error setting video selection: ${error.message}`);
    }
  }

  /**
   * Delete video record
   * @param {number} videoId - Video ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteVideo(videoId) {
    try {
      const video = await Videos.findByPk(videoId);
      if (!video) {
        throw new Error('Video not found');
      }

      await video.destroy();
      return true;
    } catch (error) {
      throw new Error(`Error deleting video: ${error.message}`);
    }
  }

  /**
   * Search videos by name
   * @param {string} searchTerm - Search term
   * @param {number} userId - User ID (optional)
   * @returns {Promise<Array>} Array of matching video records
   */
  async searchVideos(searchTerm, userId = null) {
    try {
      const whereClause = {
        [Op.or]: [
          { nombre_original: { [Op.like]: `%${searchTerm}%` } },
          { nombre_archivo: { [Op.like]: `%${searchTerm}%` } }
        ]
      };

      if (userId) {
        whereClause.id_usuario = userId;
      }

      const videos = await Videos.findAll({
        where: whereClause,
        order: [['id', 'DESC']]
      });
      return videos;
    } catch (error) {
      throw new Error(`Error searching videos: ${error.message}`);
    }
  }

  /**
   * Get user's default colors and fonts from database
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Default styles object
   */
  async getUserDefaultStyles(userId) {
    try {
      // Get default colors - try with and without predeterminado filter
      let colores = await Colores.findOne({
        where: { id_usuario: userId, predeterminado: 1 }
      });

      // If no default colors found, try to get any colors for this user
      if (!colores) {
        console.log('No default colors found, trying to get any colors for user...');
        colores = await Colores.findOne({
          where: { id_usuario: userId }
        });
      }

      // If still no colors, try to get the first available colors
      if (!colores) {
        console.log('No colors found for user, trying to get first available colors...');
        colores = await Colores.findOne();
      }

      // Get default fonts
      let fuentes = await Fuentes.findOne({
        where: { id_usuario: userId, predeterminado: 1 }
      });

      // If no default fonts found, try any fonts for this user
      if (!fuentes) {
        console.log('No default fonts found, trying to get any fonts for user...');
        fuentes = await Fuentes.findOne({
          where: { id_usuario: userId }
        });
      }

      // Debug logging
      console.log('=== DEBUG: Database Query Results ===');
      console.log('UserId:', userId);
      console.log('Colores found:', colores ? {
        id: colores.id,
        color_1: colores.color_1,
        color_2: colores.color_2,
        color_3: colores.color_3,
        color_4: colores.color_4,
        color_5: colores.color_5,
        predeterminado: colores.predeterminado
      } : 'NO COLORS FOUND');
      console.log('Fuentes found:', fuentes ? {
        id: fuentes.id,
        fuente_1: fuentes.fuente_1,
        tamano_1: fuentes.tamano_1,
        predeterminado: fuentes.predeterminado
      } : 'NO FONTS FOUND');

      const result = {
        color1: colores?.color_1 || '#38999e',
        color2: colores?.color_2 || '#CC8EC6',
        color3: colores?.color_3 || '#E6E6FA',
        color4: colores?.color_4 || '#FFFF99',
        color5: colores?.color_5 || '#98FB98',
        textColor: colores?.color_1 || '#ffffff',
        backgroundColor: colores?.color_2 || 'rgba(0,0,0,0.8)',
        fontFamily: fuentes?.fuente_1 || 'Arial',
        fontSize: fuentes?.tamano_1 ? `${fuentes.tamano_1}px` : '18px'
      };

      console.log('Final result being returned:', result);
      return result;
    } catch (error) {
      console.error('Error in getUserDefaultStyles:', error);
      throw new Error(`Error fetching user default styles: ${error.message}`);
    }
  }
}

module.exports = VideosModel;