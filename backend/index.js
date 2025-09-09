const express = require('express');
const { PORT } = require("./config");
const { createUsersRouter } = require("./Modules/Users/usersRoutes");
const { createColorsRouter } = require("./Modules/Colors/colorsRoutes");
const { createFontsRouter } = require("./Modules/Fonts/fontsRoutes");
const {createVideosRouter} = require('./Modules/Videos/videosRoutes');
const {createImagesRouter} = require('./Modules/Images/imagesRoutes');
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

app.use(cors({
  origin: 'http://localhost:5173', // tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
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

