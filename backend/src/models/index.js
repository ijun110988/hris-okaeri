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

if (db.User && db.Branch) {
  db.User.belongsTo(db.Branch, {
    foreignKey: 'branch_id',
    as: 'branch'
  });

  db.Branch.hasMany(db.User, {
    foreignKey: 'branch_id',
    as: 'users'
  });
}

if (db.User && db.Attendance) {
  db.User.hasMany(db.Attendance, {
    foreignKey: 'user_id',
    as: 'attendances'
  });

  db.Attendance.belongsTo(db.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
}

if (db.Branch && db.Attendance) {
  db.Branch.hasMany(db.Attendance, {
    foreignKey: 'branch_id',
    as: 'attendances'
  });

  db.Attendance.belongsTo(db.Branch, {
    foreignKey: 'branch_id',
    as: 'branch'
  });
}

if (db.Message && db.User) {
  db.Message.belongsTo(db.User, {
    foreignKey: 'sender_id',
    as: 'sender'
  });

  db.Message.belongsTo(db.User, {
    foreignKey: 'recipient_id',
    as: 'recipient'
  });

  db.User.hasMany(db.Message, {
    foreignKey: 'sender_id',
    as: 'sent_messages'
  });

  db.User.hasMany(db.Message, {
    foreignKey: 'recipient_id',
    as: 'received_messages'
  });
}

db.sequelize = sequelize;
db.Sequelize = sequelize.Sequelize;

module.exports = db;
