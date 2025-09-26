require('dotenv').config();

// Explicitly require mysql2 for Vercel compatibility
const mysql2 = require('mysql2');

const useSSL = process.env.DB_SSL === 'true';

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    dialectModule: mysql2,
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    dialectModule: mysql2,
  },
  production: {
    // Prefer a single URL (Railway: DB_URL => ${ MySQL.MYSQL_URL })
    // models/index.js will use this automatically if present
    use_env_variable: 'DB_URL',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectModule: mysql2,
    dialectOptions: useSSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  },
};
