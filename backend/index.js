const express = require('express');
const { PORT } = require("./config");
const { createUsersRouter } = require("./Modules/Users/usersRoutes");
const { createColorsRouter } = require("./Modules/Colors/colorsRoutes");
const { createFontsRouter } = require("./Modules/Fonts/fontsRoutes");
require('dotenv/config');
const sequelize = require("./db/database");
const cors = require('cors');
const app = express();
const path = require('path');
const fs = require('fs');

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

// Try to connect to database but continue even if it fails
try {
  sequelize.authenticate()
    .then(() => {
      console.log('Database connection has been established successfully.');
      return sequelize.sync();
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
app.use("/images", require('./Modules/Images/routes'));
app.use("/videos", require('./Modules/Videos/routes'));

console.log({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
})


app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})

