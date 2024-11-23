require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, Employee, Branch, sequelize } = require('./models');

async function createTestEmployee() {
  try {
    console.log('Starting database connection...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection successful');

    // Get or create default branch
    let [branch] = await Branch.findOrCreate({
      where: { code: 'BR001' },
      defaults: {
        name: 'Default Branch',
        code: 'BR001',
        address: 'Default Address',
        phoneNumber: '123456789',
        isActive: true
      }
    });

    // Create or update test employee user
    const username = 'johndoe';
    const password = 'emp005';
    
    console.log('Creating/Updating test employee...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Find or create user
    let [user, created] = await User.findOrCreate({
      where: { username },
      defaults: {
        password: hashedPassword,
        name: 'John Doe',
        role: 'employee',
        isActive: true
      }
    });

    if (!created) {
      // Update existing user
      await User.update({
        password: hashedPassword,
        name: 'John Doe',
        role: 'employee',
        isActive: true
      }, {
        where: { id: user.id }
      });
      
      // Refresh user data
      user = await User.findByPk(user.id);
    }

    // Create or update employee record
    await Employee.destroy({ where: { userId: user.id } });
    const employee = await Employee.create({
      userId: user.id,
      namaLengkap: 'John Doe',
      tempatLahir: 'Jakarta',
      tanggalLahir: new Date('1990-01-01'),
      alamat: '123 Main St',
      jenisKelamin: 'L',
      agama: 'Islam',
      statusNikah: 'Single',
      pendidikan: 'S1',
      position: 'Staff',
      gaji_pokok: 5000000,
      branchId: branch.id,
      createdBy: user.id
    });

    console.log('Test employee created/updated:', {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.isActive
      },
      employee: {
        id: employee.id,
        nip: employee.nip,
        namaLengkap: employee.namaLengkap
      }
    });

    // Verify the user
    console.log('Verifying employee login...');
    const foundUser = await User.findOne({ 
      where: { username },
      raw: true
    });
    
    if (foundUser) {
      const isValidPassword = await bcrypt.compare(password, foundUser.password);
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
    if (error.parent) {
      console.error('Database error details:', {
        code: error.parent.code,
        errno: error.parent.errno,
        sqlState: error.parent.sqlState,
        sqlMessage: error.parent.sqlMessage
      });
    }
  } finally {
    await sequelize.close();
  }
}

// Run the script
createTestEmployee()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
