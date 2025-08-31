const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('./controller');

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

// Routes
router.post('/upload', upload.single('video'), controller.uploadVideo);
router.post('/:videoId/subtitles', controller.uploadSubtitles);
router.post('/:videoId/audio', upload.single('audio'), controller.uploadAudioTrack);
router.get('/', controller.getAllVideos);
router.get('/:fileName', controller.getVideoByFileName);
router.delete('/:fileName', controller.deleteVideo);

module.exports = router;
