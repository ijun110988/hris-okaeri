const sequelize = require('../config/database');

async function dropTables() {
  try {
    // Drop tables directly since they might not exist
    await sequelize.query('DROP TABLE IF EXISTS news_recipients;');
    await sequelize.query('DROP TABLE IF EXISTS news;');
    
    console.log('Tables dropped successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error dropping tables:', error);
    process.exit(1);
  }
}

dropTables();
