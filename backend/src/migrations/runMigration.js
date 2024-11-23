require('dotenv').config();
const migration = require('./20240123_add_device_and_location');

async function runMigration() {
  try {
    console.log('Starting migration...');
    await migration.up();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
