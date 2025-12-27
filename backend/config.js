require('dotenv/config');

const {
    PORT = process.env.PORT,
    SALT_ROUNDS = 10,
    SECRET_JWT_KEY = "llave-secreta-para-la-codificacion-del-json-web-token"
} = process.env

module.exports = {
    PORT,
    SALT_ROUNDS,
    SECRET_JWT_KEY
};