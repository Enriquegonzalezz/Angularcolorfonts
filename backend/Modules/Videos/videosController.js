const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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

      // Generate unique filename
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(UPLOAD_DIR, fileName);

      // Write file to disk
      fs.writeFileSync(filePath, req.file.buffer);

      // Get video duration if possible (would require ffmpeg or similar in production)
      let duration = 0;
      
      // Create video record
      const videoData = {
        id: uuidv4(),
        fileName,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        duration,
        format: fileExtension.replace('.', ''),
        path: `/uploads/videos/${fileName}`,
        createdAt: new Date(),
        subtitles: [],
        audioTracks: []
      };

      // Return video data
      return res.status(201).json({
        message: 'Video uploaded successfully',
        video: videoData
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      return res.status(500).json({ message: 'Failed to upload video', error: error.message });
    }
  };

  /**
   * Upload subtitles for a video
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  uploadSubtitles = async (req, res) => {
    try {
      const { videoId } = req.params;
      const { language, entries, color, backgroundColor, fontSize, fontFamily } = req.body;
      
      if (!language || !entries || !Array.isArray(entries)) {
        return res.status(400).json({ message: 'Language and subtitle entries array are required' });
      }
      
      // Generate unique filename for subtitle file
      const subtitleId = uuidv4();
      const fileName = `${subtitleId}.json`;
      const filePath = path.join(SUBTITLES_DIR, fileName);
      
      // Create subtitle data
      const subtitleData = {
        id: subtitleId,
        videoId,
        language,
        entries: entries.map(entry => ({
          startTime: parseFloat(entry.startTime) || 0,
          endTime: parseFloat(entry.endTime) || 0,
          text: entry.text || ''
        })),
        color: color || '#ffffff',
        backgroundColor: backgroundColor || '#000000',
        fontSize: fontSize || '16px',
        fontFamily: fontFamily || 'Arial',
        path: `/uploads/subtitles/${fileName}`,
        createdAt: new Date()
      };
      
      // Write subtitle data to file
      fs.writeFileSync(filePath, JSON.stringify(subtitleData, null, 2));
      
      return res.status(201).json({
        message: 'Subtitles uploaded successfully',
        subtitle: subtitleData
      });
    } catch (error) {
      console.error('Error uploading subtitles:', error);
      return res.status(500).json({ message: 'Failed to upload subtitles', error: error.message });
    }
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
      
      // Generate unique filename
      const fileExtension = path.extname(req.file.originalname);
      const audioId = uuidv4();
      const fileName = `${audioId}${fileExtension}`;
      const filePath = path.join(AUDIO_DIR, fileName);
      
      // Write file to disk
      fs.writeFileSync(filePath, req.file.buffer);
      
      // Create audio track data
      const audioData = {
        id: audioId,
        videoId,
        language,
        fileName,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/audio/${fileName}`,
        createdAt: new Date()
      };
      
      return res.status(201).json({
        message: 'Audio track uploaded successfully',
        audioTrack: audioData
      });
    } catch (error) {
      console.error('Error uploading audio track:', error);
      return res.status(500).json({ message: 'Failed to upload audio track', error: error.message });
    }
  };

  /**
   * Get all videos
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllVideos = async (req, res) => {
    try {
      // Read directory and get all video files
      const files = fs.readdirSync(UPLOAD_DIR);
      
      const videos = files.map(file => {
        const filePath = path.join(UPLOAD_DIR, file);
        const stats = fs.statSync(filePath);
        
        return {
          fileName: file,
          size: stats.size,
          format: path.extname(file).replace('.', ''),
          path: `/uploads/videos/${file}`,
          createdAt: stats.ctime
        };
      });
      
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
      const filePath = path.join(UPLOAD_DIR, fileName);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      const stats = fs.statSync(filePath);
      
      const videoData = {
        fileName,
        size: stats.size,
        format: path.extname(fileName).replace('.', ''),
        path: `/uploads/videos/${fileName}`,
        createdAt: stats.ctime
      };
      
      return res.status(200).json({ video: videoData });
    } catch (error) {
      console.error('Error getting video:', error);
      return res.status(500).json({ message: 'Failed to get video', error: error.message });
    }
  };

  /**
   * Delete video by filename
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteVideo = async (req, res) => {
    try {
      const { fileName } = req.params;
      const filePath = path.join(UPLOAD_DIR, fileName);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      // Delete file
      fs.unlinkSync(filePath);
      
      return res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
      console.error('Error deleting video:', error);
      return res.status(500).json({ message: 'Failed to delete video', error: error.message });
    }
  };
}
module.exports = { VideosController};
