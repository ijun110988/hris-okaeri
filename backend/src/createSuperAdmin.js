require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, sequelize } = require('./models');

// Debug: Print environment variables
console.log('Environment variables:', {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME
});

async function createSuperAdmin() {
  try {
    console.log('Starting database connection...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection successful');

    // Find existing superadmin
    console.log('Checking for existing superadmin...');
    let superAdmin = await User.findOne({
      where: { username: 'superadmin' },
      raw: true
    });

    if (superAdmin) {
      console.log('Found existing superadmin:', {
        id: superAdmin.id,
        username: superAdmin.username,
        role: superAdmin.role,
        isActive: superAdmin.isActive
      });
      
      // Update superadmin
      console.log('Updating superadmin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.update({
        password: hashedPassword,
        role: 'super_admin',
        isActive: true,
        name: 'Super Admin',
        branchId: null
      }, {
        where: { username: 'superadmin' }
      });
      
      console.log('Superadmin updated successfully');
    } else {
      // Create super admin user
      console.log('Creating new superadmin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      superAdmin = await User.create({
        username: 'superadmin',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'super_admin',
        isActive: true,
        branchId: null
      });
      console.log('Created superadmin user:', {
        id: superAdmin.id,
        username: superAdmin.username,
        role: superAdmin.role,
        isActive: superAdmin.isActive
      });
    }

    // Verify the user
    console.log('Verifying superadmin...');
    const verifyPassword = 'admin123';
    const foundUser = await User.findOne({ 
      where: { username: 'superadmin' },
      raw: true
    });
    
    if (foundUser) {
      const isValidPassword = await bcrypt.compare(verifyPassword, foundUser.password);
      console.log('Verification results:', {
        userFound: true,
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        isActive: foundUser.isActive,
        passwordValid: isValidPassword
      });
    } else {
      console.log('Verification failed: User not found');
    }

  } catch (error) {
    console.error('Error:', error);
    // Debug: Print full error details
    if (error.parent) {
      console.error('Database error details:', {
        code: error.parent.code,
        errno: error.parent.errno,
        sqlState: error.parent.sqlState,
        sqlMessage: error.parent.sqlMessage
      });
    }
  } finally {
    console.log('Closing database connection...');
    await sequelize.close();
    console.log('Database connection closed');
    // Force exit since the process might be hanging
    process.exit(0);
  }
}

// Debug: Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

console.log('Script started');
createSuperAdmin().catch(error => {
  console.error('Top-level error:', error);
  process.exit(1);
});
