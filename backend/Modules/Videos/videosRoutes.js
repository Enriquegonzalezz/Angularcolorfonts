const {Router} = require('express');
const multer = require('multer');
const {VideosController} = require('./videosController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    // Accept only video files for video upload
    if (file.fieldname === 'video' && file.mimetype.startsWith('video/')) {
      cb(null, true);
    } 
    // Accept only audio files for audio upload
    else if (file.fieldname === 'audio' && file.mimetype.startsWith('audio/')) {
      cb(null, true);
    }
    else {
      cb(new Error('Invalid file type!'), false);
    }
  }
});
const createVideosRouter = () => {
  const videosRouter = Router();
  const videosController = new VideosController();
  // Routes
  videosRouter.post('/upload', upload.single('video'), videosController.uploadVideo);
  videosRouter.post('/:videoId/subtitles', videosController.uploadSubtitles);
  videosRouter.post('/:videoId/audio', upload.single('audio'), videosController.uploadAudioTrack);
  videosRouter.get('/', videosController.getAllVideos);
  videosRouter.get('/:fileName', videosController.getVideoByFileName);
  videosRouter.delete('/:fileName', videosController.deleteVideo);
  return videosRouter
}
module.exports = {createVideosRouter};
