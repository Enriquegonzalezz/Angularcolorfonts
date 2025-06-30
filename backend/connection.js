const mysql = require('mysql2/promise');
require('dotenv/config');

async function createConnection() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST , //nombre del servicio
            user: process.env.DB_USERNAME ,
            port: process.env.DB_PORT ,
            password: process.env.DB_PASSWORD ,
            database: process.env.DB_DATABASE ,
        });
        console.log('Connected to the database.');
    } catch (error) { 
        console.error('Error connecting to the database:', error);
    }
    return connection;
}


module.exports = createConnection;
