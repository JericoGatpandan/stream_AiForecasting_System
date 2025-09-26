'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
const envVarName = config.use_env_variable;
const connectionUrl = envVarName ? process.env[envVarName] : undefined;

if (envVarName && connectionUrl && connectionUrl.trim()) {
  // Preferred: single connection URL (e.g., Railway MYSQL_URL via DB_URL)
  sequelize = new Sequelize(connectionUrl, config);
} else {
  // Fallback to discrete credentials
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Import the FloodCharacteristics model
const FloodCharacteristics = require('./floodCharacteristics')(sequelize, Sequelize.DataTypes);
db.FloodCharacteristics = FloodCharacteristics;

module.exports = db;
