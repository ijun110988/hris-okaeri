const { User, Branch, Employee } = require('../models');
const sequelize = require('../config/database');

async function createTestUser() {
  try {
    await sequelize.sync();

    // Create test branch
    const branch = await Branch.create({
      code: 'BR001',
      name: 'Test Branch',
      address: 'Test Address',
      phone: '1234567890'
    });

    // Create test user
    const user = await User.create({
      username: 'johndoe',
      password: 'emp005',
      name: 'John Doe',
      role: 'employee',
      isActive: true
    });

    // Create test employee
    const employee = await Employee.create({
      namaLengkap: 'John Doe',
      tempatLahir: 'Test City',
      tanggalLahir: '1990-01-01',
      alamat: 'Test Address',
      jenisKelamin: 'L',
      agama: 'Islam',
      statusNikah: 'Single',
      pendidikan: 'S1',
      position: 'Staff',
      gaji_pokok: 5000000,
      userId: user.id,
      branchId: branch.id,
      createdBy: 1 // Assuming superadmin id is 1
    });

    console.log('Test user created successfully:', {
      user: user.toJSON(),
      employee: employee.toJSON()
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
