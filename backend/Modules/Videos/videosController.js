const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const VideosModel = require('./videosModel');

// Directory to store uploaded videos
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/videos');
const SUBTITLES_DIR = path.join(__dirname, '../../public/uploads/subtitles');
const AUDIO_DIR = path.join(__dirname, '../../public/uploads/audio');

// Ensure upload directories exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(SUBTITLES_DIR)) {
  fs.mkdirSync(SUBTITLES_DIR, { recursive: true });
}
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

class VideosController{
  constructor() {
    this.videosModel = new VideosModel();
  }

  /**
   * Format duration from seconds to HH:MM:SS
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration as HH:MM:SS
   */
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Upload a video
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  uploadVideo = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No video file provided' });
      }

      const { userId, duration } = req.body;
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Generate unique filename
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(UPLOAD_DIR, fileName);

      // Write file to disk
      fs.writeFileSync(filePath, req.file.buffer);

      // Use duration from frontend (convert to HH:MM:SS format)
      const formattedDuration = duration ? this.formatDuration(parseFloat(duration)) : '00:00:00';
      
      // Create video record in database
      const videoData = {
        id_usuario: parseInt(userId),
        video_url: `/uploads/videos/${fileName}`,
        nombre_original: req.file.originalname,
        nombre_archivo: fileName,
        tamano: req.file.size.toString(),
        extension: fileExtension.replace('.', ''),
        duracion: formattedDuration,
        color_letra_subtitulo: '#ffffff',
        fondo_subtitulo: '#000000',
        seleccionada: 0
      };

      const savedVideo = await this.videosModel.createVideo(videoData);

      // Return video data
      return res.status(201).json({
        message: 'Video uploaded successfully',
        video: savedVideo
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      return res.status(500).json({ message: 'Failed to upload video', error: error.message });
    }
  };

  /**
   * Upload subtitles for a video (VTT format)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  uploadSubtitles = async (req, res) => {
    try {
      const { videoId } = req.params;
      const { language, entries, textColor, backgroundColor, fontSize, fontFamily } = req.body;
      
      if (!videoId || !language || !entries || !Array.isArray(entries)) {
        return res.status(400).json({ message: 'Video ID, language, and subtitle entries array are required' });
      }

      // Validate language
      if (!['es', 'en', 'spanish', 'english'].includes(language.toLowerCase())) {
        return res.status(400).json({ message: 'Language must be "es" (Spanish) or "en" (English)' });
      }
      
      // Generate unique filename for VTT file
      const subtitleId = uuidv4();
      const fileName = `${subtitleId}.vtt`;
      const filePath = path.join(SUBTITLES_DIR, fileName);
      
      // Create VTT content
      let vttContent = 'WEBVTT\n\n';
      
      entries.forEach((entry, index) => {
        const startTime = this.formatTimeForVTT(parseFloat(entry.startTime) || 0);
        const endTime = this.formatTimeForVTT(parseFloat(entry.endTime) || 0);
        const text = entry.text || '';
        
        vttContent += `${index + 1}\n`;
        vttContent += `${startTime} --> ${endTime}\n`;
        vttContent += `${text}\n\n`;
      });
      
      // Write VTT file to disk
      fs.writeFileSync(filePath, vttContent, 'utf8');
      
      // Update video record in database with subtitle filename
      const normalizedLanguage = language.toLowerCase() === 'es' || language.toLowerCase() === 'spanish' ? 'es' : 'en';
      await this.videosModel.updateSubtitle(parseInt(videoId), normalizedLanguage, fileName);
      
      // Update subtitle styling if provided
      if (textColor || backgroundColor || fontSize || fontFamily) {
        await this.videosModel.updateSubtitleStyling(
          parseInt(videoId), 
          textColor || '#ffffff', 
          backgroundColor || '#000000',
          fontSize || '18px',
          fontFamily || null
        );
      }
      
      return res.status(201).json({
        message: 'Subtitles uploaded successfully',
        subtitle: {
          fileName,
          language: normalizedLanguage,
          path: `/uploads/subtitles/${fileName}`,
          entriesCount: entries.length
        }
      });
    } catch (error) {
      console.error('Error uploading subtitles:', error);
      return res.status(500).json({ message: 'Failed to upload subtitles', error: error.message });
    }
  };

  /**
   * Format time in seconds to VTT format (HH:MM:SS.mmm)
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  formatTimeForVTT(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  /**
   * Upload audio track for a video
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  uploadAudioTrack = async (req, res) => {
    try {
      const { videoId } = req.params;
      const { language } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: 'No audio file provided' });
      }
      
      if (!language) {
        return res.status(400).json({ message: 'Language is required' });
      }

      // Validate language
      if (!['es', 'en', 'spanish', 'english'].includes(language.toLowerCase())) {
        return res.status(400).json({ message: 'Language must be "es" (Spanish) or "en" (English)' });
      }

      // Validate audio file type
      if (!req.file.mimetype.startsWith('audio/')) {
        return res.status(400).json({ message: 'File must be an audio file' });
      }
      
      // Generate unique filename
      const fileExtension = path.extname(req.file.originalname);
      const audioId = uuidv4();
      const fileName = `${audioId}${fileExtension}`;
      const filePath = path.join(AUDIO_DIR, fileName);
      
      // Write file to disk
      fs.writeFileSync(filePath, req.file.buffer);
      
      // Update video record in database with audio filename
      const normalizedLanguage = language.toLowerCase() === 'es' || language.toLowerCase() === 'spanish' ? 'es' : 'en';
      await this.videosModel.updateAudio(parseInt(videoId), normalizedLanguage, fileName);
      
      return res.status(201).json({
        message: 'Audio track uploaded successfully',
        audioTrack: {
          fileName,
          language: normalizedLanguage,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: `/uploads/audio/${fileName}`
        }
      });
    } catch (error) {
      console.error('Error uploading audio track:', error);
      return res.status(500).json({ message: 'Failed to upload audio track', error: error.message });
    }
  };

  /**
   * Get all videos for a user or all videos (admin)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllVideos = async (req, res) => {
    try {
      const { userId } = req.query;
      let videos;

      if (userId) {
        videos = await this.videosModel.getVideosByUser(parseInt(userId));
      } else {
        videos = await this.videosModel.getAllVideos();
      }
      
      return res.status(200).json({ videos });
    } catch (error) {
      console.error('Error getting videos:', error);
      return res.status(500).json({ message: 'Failed to get videos', error: error.message });
    }
  };

  /**
   * Get video by filename
   * @param {Object} req - Express request object 
   * @param {Object} res - Express response object
   */
  getVideoByFileName = async (req, res) => {
    try {
      const { fileName } = req.params;
      const video = await this.videosModel.getVideoByFilename(fileName);
      
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      return res.status(200).json({ video });
    } catch (error) {
      console.error('Error getting video:', error);
      return res.status(500).json({ message: 'Failed to get video', error: error.message });
    }
  };

  /**
   * Get video by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getVideoById = async (req, res) => {
    try {
      const { videoId } = req.params;
      const video = await this.videosModel.getVideoById(parseInt(videoId));
      
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      return res.status(200).json({ video });
    } catch (error) {
      console.error('Error getting video by ID:', error);
      return res.status(500).json({ message: 'Failed to get video', error: error.message });
    }
  };

  /**
   * Delete video by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteVideo = async (req, res) => {
    try {
      const { videoId } = req.params;
      const video = await this.videosModel.getVideoById(parseInt(videoId));
      
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      // Delete physical files
      const videoPath = path.join(UPLOAD_DIR, video.nombre_archivo);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
      
      // Delete subtitle files if they exist
      if (video.nombre_subtitulo_1) {
        const subtitlePath1 = path.join(SUBTITLES_DIR, video.nombre_subtitulo_1);
        if (fs.existsSync(subtitlePath1)) {
          fs.unlinkSync(subtitlePath1);
        }
      }
      
      if (video.nombre_subtitulo_2) {
        const subtitlePath2 = path.join(SUBTITLES_DIR, video.nombre_subtitulo_2);
        if (fs.existsSync(subtitlePath2)) {
          fs.unlinkSync(subtitlePath2);
        }
      }
      
      // Delete audio files if they exist
      if (video.nombre_audio_1) {
        const audioPath1 = path.join(AUDIO_DIR, video.nombre_audio_1);
        if (fs.existsSync(audioPath1)) {
          fs.unlinkSync(audioPath1);
        }
      }
      
      if (video.nombre_audio_2) {
        const audioPath2 = path.join(AUDIO_DIR, video.nombre_audio_2);
        if (fs.existsSync(audioPath2)) {
          fs.unlinkSync(audioPath2);
        }
      }
      
      // Delete database record
      await this.videosModel.deleteVideo(parseInt(videoId));
      
      return res.status(200).json({ message: 'Video and associated files deleted successfully' });
    } catch (error) {
      console.error('Error deleting video:', error);
      return res.status(500).json({ message: 'Failed to delete video', error: error.message });
    }
  };

  /**
   * Update subtitle styling
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateSubtitleStyling = async (req, res) => {
    try {
      const { videoId } = req.params;
      const { textColor, backgroundColor, fontSize, fontFile } = req.body;
      
      if (!textColor && !backgroundColor && !fontSize && !fontFile) {
        return res.status(400).json({ message: 'At least one styling property is required' });
      }
      
      const updatedVideo = await this.videosModel.updateSubtitleStyling(
        parseInt(videoId),
        textColor || '#ffffff',
        backgroundColor || '#000000',
        fontSize || '18px',
        fontFile || null
      );
      
      return res.status(200).json({
        message: 'Subtitle styling updated successfully',
        video: updatedVideo
      });
    } catch (error) {
      console.error('Error updating subtitle styling:', error);
      return res.status(500).json({ message: 'Failed to update subtitle styling', error: error.message });
    }
  };

  /**
   * Upload font file for subtitles
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  uploadFont = async (req, res) => {
    try {
      const { videoId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ message: 'No font file provided' });
      }

      // Validate font file type
      if (!req.file.mimetype.includes('font') && !req.file.originalname.toLowerCase().endsWith('.ttf')) {
        return res.status(400).json({ message: 'File must be a TTF font file' });
      }
      
      // Generate unique filename
      const fileExtension = path.extname(req.file.originalname);
      const fontId = uuidv4();
      const fileName = `${fontId}${fileExtension}`;
      const filePath = path.join(__dirname, '../../uploads/fonts', fileName);
      
      // Create fonts directory if it doesn't exist
      const fontsDir = path.dirname(filePath);
      if (!fs.existsSync(fontsDir)) {
        fs.mkdirSync(fontsDir, { recursive: true });
      }
      
      // Write file to disk
      fs.writeFileSync(filePath, req.file.buffer);
      
      // Update video record in database with font filename
      await this.videosModel.updateSubtitleStyling(
        parseInt(videoId),
        null, // textColor
        null, // backgroundColor  
        null, // fontSize
        fileName // fontFile
      );
      
      return res.status(201).json({
        message: 'Font uploaded successfully',
        font: {
          fileName,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: `/uploads/fonts/${fileName}`
        }
      });
    } catch (error) {
      console.error('Error uploading font:', error);
      return res.status(500).json({ message: 'Failed to upload font', error: error.message });
    }
  };

  /**
   * Set video as selected
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  setSelectedVideo = async (req, res) => {
    try {
      const { videoId } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const updatedVideo = await this.videosModel.setSelectedVideo(parseInt(videoId), parseInt(userId));
      
      return res.status(200).json({
        message: 'Video set as selected successfully',
        video: updatedVideo
      });
    } catch (error) {
      console.error('Error setting selected video:', error);
      return res.status(500).json({ message: 'Failed to set selected video', error: error.message });
    }
  };

  /**
   * Search videos
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  searchVideos = async (req, res) => {
    try {
      const { query, userId } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      
      const videos = await this.videosModel.searchVideos(query, userId ? parseInt(userId) : null);
      
      return res.status(200).json({ videos });
    } catch (error) {
      console.error('Error searching videos:', error);
      return res.status(500).json({ message: 'Failed to search videos', error: error.message });
    }
  };

  /**
   * Get video duration using ffprobe
   * @param {string} filePath - Path to video file
   * @returns {Promise<string>} Duration in HH:MM:SS format
   */
  async getVideoDuration(filePath) {
    return new Promise((resolve, reject) => {
      const command = `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Error getting video duration:', error);
          // Fallback to default duration if ffprobe fails
          resolve("00:00:00");
          return;
        }
        
        try {
          const durationSeconds = parseFloat(stdout.trim());
          if (isNaN(durationSeconds)) {
            resolve("00:00:00");
            return;
          }
          
          // Convert seconds to HH:MM:SS format
          const hours = Math.floor(durationSeconds / 3600);
          const minutes = Math.floor((durationSeconds % 3600) / 60);
          const seconds = Math.floor(durationSeconds % 60);
          
          const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          resolve(formattedDuration);
        } catch (parseError) {
          console.error('Error parsing duration:', parseError);
          resolve("00:00:00");
        }
      });
    });
  };
}

module.exports = VideosController;
