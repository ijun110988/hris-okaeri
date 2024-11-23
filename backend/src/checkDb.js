require('dotenv').config();
const { User, sequelize } = require('./models');

async function checkDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');

    const users = await User.findAll();
    console.log('Total users:', users.length);
    console.log('Users:', users.map(u => ({ 
      id: u.id, 
      username: u.username,
      role: u.role,
      isActive: u.isActive
    })));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
