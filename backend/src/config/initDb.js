const { sequelize } = require('../models');
const logger = require('./logger');

async function initializeDatabase() {
  try {
    logger.info('Initializing database connection...');
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Sync without force to preserve data
    await sequelize.sync({ force: false });
    logger.info('Database synchronized successfully.');

    return true;
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = initializeDatabase;
