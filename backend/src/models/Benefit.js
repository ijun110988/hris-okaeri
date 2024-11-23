const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Benefit = sequelize.define('Benefit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('BPJS_COMPANY', 'BPJS_EMPLOYEE', 'ALLOWANCE', 'DEDUCTION'),
    allowNull: false,
    defaultValue: 'ALLOWANCE'
  },
  multiplier: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  isFixed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'If true, uses fixedAmount instead of multiplier'
  },
  fixedAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'benefits',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['code', 'is_active'],
      where: {
        is_active: true
      }
    }
  ]
});

module.exports = Benefit;
