const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

async function up() {
  try {
    await sequelize.getQueryInterface().addColumn('attendances', 'device_info', {
      type: DataTypes.JSON,
      allowNull: true,
      after: 'qr_token'
    });

    await sequelize.getQueryInterface().addColumn('attendances', 'check_in_location', {
      type: DataTypes.JSON,
      allowNull: true,
      after: 'device_info'
    });

    await sequelize.getQueryInterface().addColumn('attendances', 'check_out_location', {
      type: DataTypes.JSON,
      allowNull: true,
      after: 'check_in_location'
    });

    console.log('Migration: Added device_info and location columns');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function down() {
  try {
    await sequelize.getQueryInterface().removeColumn('attendances', 'device_info');
    await sequelize.getQueryInterface().removeColumn('attendances', 'check_in_location');
    await sequelize.getQueryInterface().removeColumn('attendances', 'check_out_location');
    
    console.log('Migration: Removed device_info and location columns');
  } catch (error) {
    console.error('Migration rollback failed:', error);
    throw error;
  }
}

module.exports = {
  up,
  down
};
