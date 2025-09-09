const express = require('express');
const { PORT } = require("./config");
const { createUsersRouter } = require("./Modules/Users/usersRoutes");
const { createColorsRouter } = require("./Modules/Colors/colorsRoutes");
const { createFontsRouter } = require("./Modules/Fonts/fontsRoutes");
const {createVideosRouter} = require('./Modules/Videos/videosRoutes');
const {createImagesRouter} = require('./Modules/Images/imagesRoutes');
const multer = require('multer');

require('dotenv/config');

// Try to use MySQL connection first, fallback to SQLite if MySQL fails
let sequelize;
try {
  sequelize = require("./db/database");
  console.log('Using MySQL database connection');
} catch (error) {
  console.log('MySQL connection failed, falling back to SQLite');
  sequelize = require("./db/database_sqlite");
}

const cors = require('cors');
const app = express();
const path = require('path');
const fs = require('fs');
const { create } = require('domain');

app.use(cors());
app.use(express.json());

// Ensure upload directories exist
const uploadDirs = [
  path.join(__dirname, 'public/uploads'),
  path.join(__dirname, 'public/uploads/images'),
  path.join(__dirname, 'public/uploads/videos'),
  path.join(__dirname, 'public/uploads/subtitles'),
  path.join(__dirname, 'public/uploads/audio')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

app.use('/public', express.static(path.join(__dirname, 'public')));


//config de almacenamiento kike 
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public/uploads/images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadImage = multer({ storage: imageStorage });

// Endpoint para subir imágenes
app.post('/api/images/upload', uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }
  
  const imageInfo = {
    id: req.file.filename,
    name: req.file.originalname,
    url: `${req.protocol}://${req.get('host')}/public/uploads/images/${req.file.filename}`,
    uploadDate: new Date()
  };
  
  res.status(201).json(imageInfo);
});

// Endpoint para obtener imágenes
app.get('/api/images', (req, res) => {
  const imageDir = path.join(__dirname, 'public/uploads/images');
  
  fs.readdir(imageDir, (err, files) => {
    if (err) {
      console.error('Error leyendo directorio de imágenes:', err);
      return res.status(500).json({ error: 'Error al leer las imágenes' });
    }
    
    const images = files.filter(file => file.startsWith('image-')).map(file => {
      return {
        id: file,
        name: file.split('-').slice(1).join('-'), // Recupera el nombre original
        url: `${req.protocol}://${req.get('host')}/public/uploads/images/${file}`,
        uploadDate: fs.statSync(path.join(imageDir, file)).birthtime
      };
    });
    
    res.json(images);
  });
});
  
// Try to connect to database but continue even if it fails
try {
  sequelize.authenticate()
    .then(() => {
      console.log('Database connection has been established successfully.');
      return sequelize.sync({});
    })
    .then(() => {
      console.log('Database synchronized successfully.');
    })
    .catch(err => {
      console.error('Database connection/sync error:', err);
      console.log('Continuing without database for file storage modules...');
    });
} catch (error) {
  console.error('Database setup error:', error);
  console.log('Continuing without database for file storage modules...');
}

app.use("/", createUsersRouter());
app.use("/colors", createColorsRouter());
app.use("/fonts", createFontsRouter());
app.use("/images", createImagesRouter());
app.use("/videos", createVideosRouter());

console.log({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
})


app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})

