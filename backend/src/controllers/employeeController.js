const { Employee, User, Branch } = require('../models');
const bcrypt = require('bcryptjs');

// Create new employee
const createEmployee = async (req, res) => {
  try {
    console.log('Creating employee with data:', req.body);
    
    const {
      namaLengkap,
      tempatLahir,
      tanggalLahir,
      alamat,
      jenisKelamin,
      agama,
      statusNikah,
      pendidikan,
      position,
      gaji_pokok,
      noTelp,
      email,
      branchId,
      user
    } = req.body;

    // Validate branch exists
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return res.status(400).json({
        status: 'error',
        message: 'Branch not found'
      });
    }

    // Create user account first (password will be hashed by model hook)
    const newUser = await User.create({
      username: user.username,
      password: user.password,  
      name: user.name,
      role: user.role || 'employee',
      isActive: true,
      createdBy: req.user.id
    });

    // Create employee with the user account
    const employee = await Employee.create({
      namaLengkap,
      tempatLahir,
      tanggalLahir,
      alamat,
      jenisKelamin,
      agama,
      statusNikah,
      pendidikan,
      position,
      gaji_pokok,
      noTelp,
      email,
      branchId,
      userId: newUser.id,
      statusKeaktifan: true,
      createdBy: req.user.id
    });

    console.log('Employee created:', employee.id);

    res.status(201).json({
      status: 'success',
      data: {
        employee,
        user: {
          id: newUser.id,
          username: newUser.username,
          name: newUser.name,
          role: newUser.role
        }
      }
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create employee'
    });
  }
};

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [{
        model: Branch,
        attributes: ['name', 'location']
      }]
    });

    res.status(200).json({
      status: 'success',
      data: employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch employees'
    });
  }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id, {
      include: [{
        model: Branch,
        attributes: ['name', 'location']
      }]
    });

    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch employee'
    });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }

    await employee.update(updateData);

    res.status(200).json({
      status: 'success',
      data: employee
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update employee'
    });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }

    await employee.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete employee'
    });
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};
