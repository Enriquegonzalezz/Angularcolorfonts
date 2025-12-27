const {Router} = require('express');
const VideosController = require('./videosController');
const { uploadVideo, uploadAudio, uploadSubtitle, handleMulterError } = require('../../middleware/uploadVideos');

const createVideosRouter = () => {
  const videosRouter = Router();
  const videosController = new VideosController();
  
  // Video upload route
  videosRouter.post('/upload', uploadVideo.single('video'), videosController.uploadVideo);
  
  // Subtitle upload route (VTT files)
  videosRouter.post('/:videoId/subtitles', videosController.uploadSubtitles);
  
  // Audio upload route (MP3 files)
  videosRouter.post('/:videoId/audio', uploadAudio.single('audio'), videosController.uploadAudioTrack);
  
  // Get all videos (with optional userId filter)
  videosRouter.get('/', videosController.getAllVideos);
  
  // Get user default styles for subtitles and tangram
  videosRouter.get('/default-styles', videosController.getDefaultStyles);

  // Debug endpoint to check database contents
  videosRouter.get('/debug-database', videosController.debugDatabase);
  
  // Get video by ID
  videosRouter.get('/id/:videoId', videosController.getVideoById);
  
  // Get video by filename
  videosRouter.get('/file/:fileName', videosController.getVideoByFileName);
  
  // Subtitle styling persistence removed; default styles handled on frontend
  
  // Set video selection status (supports multi-selection)
  videosRouter.put('/:videoId/select', videosController.setSelectedVideo);
  
  // Search videos
  videosRouter.get('/search', videosController.searchVideos);
  
  // Delete video by ID
  videosRouter.delete('/:videoId', videosController.deleteVideo);
  
  // Error handling middleware
  videosRouter.use(handleMulterError);
  
  return videosRouter;
}

module.exports = {createVideosRouter};
