const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Attempt to load environment files (NODE_ENV specific first)
const candidates = [
  `.env.${process.env.NODE_ENV}`,
  '.env'
];

for (const file of candidates) {
  const full = path.join(process.cwd(), 'backend', file);
  if (fs.existsSync(full)) {
    dotenv.config({ path: full });
    break;
  }
}

const required = {
  DB_HOST: 'Database host name or address',
  DB_USER: 'Database user',
  DB_PASSWORD: 'Database user password',
  DB_NAME: 'Database name',
  PORT: 'HTTP server port'
};

const missing = Object.keys(required).filter(k => !process.env[k] || process.env[k].trim() === '');
if (missing.length) {
  console.warn('[env] Missing required environment variables:');
  missing.forEach(k => console.warn(` - ${k}: ${required[k]}`));
}

const config = {
  env: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || '').startsWith('prod'),
  port: parseInt(process.env.PORT, 10) || 5500,
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME
  },
  log: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
  }
};

module.exports = config;
