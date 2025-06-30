const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/fonts');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// solo archivos .ttf
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.ttf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos .ttf'));
  }
};

// Exportar el middleware
const uploadFuente = multer({ storage, fileFilter });

module.exports = uploadFuente;