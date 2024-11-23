require('dotenv').config();
const { User } = require('./models');

async function checkSuperAdmin() {
  try {
    console.log('Checking superadmin user...');
    
    const user = await User.findOne({
      where: {
        username: 'superadmin'
      },
      raw: true
    });

    if (user) {
      console.log('Superadmin found:', {
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        hasPassword: !!user.password
      });
    } else {
      console.log('Superadmin user not found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkSuperAdmin();
