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

app.use(cors());
app.use(express.json());

app.use('/public', express.static(path.join(__dirname, 'public')));

sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

sequelize.sync()
  .then(() => {
    console.log('Database synchronized successfully.');
  })
  .catch(err => {
    console.error('Error synchronizing the database:', err);
  });  

app.use("/", createUsersRouter());
app.use("/colors", createColorsRouter());
app.use("/fonts", createFontsRouter());

console.log({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
})


app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})

