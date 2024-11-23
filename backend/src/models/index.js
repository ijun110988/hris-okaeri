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

// Set up associations
if (db.Attendance && db.Branch) {
  db.Attendance.belongsTo(db.Branch, {
    foreignKey: 'branchId',
    as: 'Branch'
  });

  db.Branch.hasMany(db.Attendance, {
    foreignKey: 'branchId',
    as: 'Attendances'
  });
}

if (db.Branch && db.Employee) {
  db.Branch.hasMany(db.Employee, {
    foreignKey: 'branchId'
  });

  db.Employee.belongsTo(db.Branch, {
    foreignKey: 'branchId'
  });
}

db.sequelize = sequelize;
db.Sequelize = sequelize.Sequelize;

module.exports = db;
