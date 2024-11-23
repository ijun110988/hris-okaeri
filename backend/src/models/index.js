'use strict';

const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const sequelize = require('../config/database');
const db = {};

// First pass: Import all models
fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    db[model.name] = model;
  });

// Second pass: Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = sequelize.Sequelize;

module.exports = db;
