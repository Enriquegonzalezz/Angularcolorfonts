const { Videos } = require('../../db/schema');
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
        color_letra_subtitulo: videoData.color_letra_subtitulo || '#ffffff',
        fondo_subtitulo: videoData.fondo_subtitulo || '#000000',
        seleccionada: videoData.seleccionada || 0
      });
      return video;
    } catch (error) {
      throw new Error(`Error creating video: ${error.message}`);
    }
  }

  /**
   * Get all videos for a specific user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of video records
   */
  async getVideosByUser(userId) {
    try {
      const videos = await Videos.findAll({
        where: { id_usuario: userId },
        order: [['id', 'DESC']]
      });
      return videos;
    } catch (error) {
      throw new Error(`Error fetching videos: ${error.message}`);
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
   * Set video as selected
   * @param {number} videoId - Video ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated video record
   */
  async setSelectedVideo(videoId, userId) {
    try {
      // First, unselect all videos for this user
      await Videos.update(
        { seleccionada: 0 },
        { where: { id_usuario: userId } }
      );

      // Then select the specified video
      const video = await Videos.findOne({
        where: { id: videoId, id_usuario: userId }
      });

      if (!video) {
        throw new Error('Video not found or does not belong to user');
      }

      await video.update({ seleccionada: 1 });
      return video;
    } catch (error) {
      throw new Error(`Error setting selected video: ${error.message}`);
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
}

module.exports = VideosModel;