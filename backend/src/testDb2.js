require('dotenv').config();
const { Sequelize } = require('sequelize');

async function testConnection() {
  console.log('Starting test...');
  
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'hris_okaeri',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '123456',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 8889,
      dialect: 'mysql',
      logging: console.log // Enable logging
    }
  );

  try {
    console.log('Testing connection...');
    await sequelize.authenticate();
    console.log('Connection successful!');

    // Define User model directly
    const User = sequelize.define('User', {
      username: Sequelize.STRING,
      password: Sequelize.STRING,
      name: Sequelize.STRING,
      role: Sequelize.STRING,
      isActive: Sequelize.BOOLEAN
    });

    console.log('Syncing database...');
    await sequelize.sync();
    console.log('Database synced!');

    console.log('Creating/updating superadmin...');
    const [user, created] = await User.findOrCreate({
      where: { username: 'superadmin' },
      defaults: {
        password: 'admin123', // We'll hash this in the real code
        name: 'Super Admin',
        role: 'super_admin',
        isActive: true
      }
    });

    console.log(created ? 'Created new user:' : 'Found existing user:', {
      id: user.id,
      username: user.username,
      role: user.role,
      isActive: user.isActive
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('Closing connection...');
    await sequelize.close();
    process.exit(0);
  }
}

testConnection();
