const sequelize = require('../config/database');

async function addTimestampsToTable(tableName) {
  try {
    // Check if timestamps columns exist
    const [columns] = await sequelize.query(`SHOW COLUMNS FROM ${tableName}`);
    const hasCreatedAt = columns.some(col => col.Field === 'created_at');
    const hasUpdatedAt = columns.some(col => col.Field === 'updated_at');
    
    // Add timestamp columns if they don't exist
    if (!hasCreatedAt) {
      await sequelize.query(`ALTER TABLE ${tableName} ADD COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP`);
    }
    if (!hasUpdatedAt) {
      await sequelize.query(`ALTER TABLE ${tableName} ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
    }
    
    console.log(`Successfully added timestamps to ${tableName}`);
  } catch (error) {
    console.error(`Error adding timestamps to ${tableName}:`, error);
  }
}

async function runMigration() {
  try {
    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // List of tables to update
    const tables = ['branches', 'users', 'employees', 'attendances', 'leave_requests', 'qr_codes', 'salaries'];
    
    // Add timestamps to each table
    for (const table of tables) {
      await addTimestampsToTable(table);
    }

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
