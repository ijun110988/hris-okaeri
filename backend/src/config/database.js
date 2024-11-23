const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
      timezone: '+07:00',
      // Allow zero dates to be converted to NULL
      supportBigNumbers: true,
      bigNumberStrings: true
    },
    timezone: '+07:00',
    define: {
      timestamps: true,
      paranoid: true, // Enable soft deletes
      // Use underscored naming
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at'
    }
  }
);

// Test the connection and set session variables
sequelize
  .authenticate()
  .then(async () => {
    console.log('Database connection established successfully.');
    // Set session variables to handle zero dates
    await sequelize.query("SET SESSION sql_mode=''");
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
