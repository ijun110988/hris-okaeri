const { Branch } = require('../models');

// Generate unique branch code
const generateBranchCode = async () => {
  const prefix = process.env.BRANCH_CODE_PREFIX || 'OKE';
  const length = parseInt(process.env.BRANCH_CODE_LENGTH) || 6;
  
  // Generate a random number sequence
  const randomNum = Math.floor(Math.random() * Math.pow(10, length - prefix.length))
    .toString()
    .padStart(length - prefix.length, '0');
  
  const code = `${prefix}${randomNum}`;
  
  // Check if code already exists
  const existingBranch = await Branch.findOne({ where: { code } });
  if (existingBranch) {
    // If code exists, generate a new one recursively
    return generateBranchCode();
  }
  
  return code;
};

// Create new branch
const createBranch = async (req, res) => {
  try {
    const { name, address, phoneNumber, email, latitude, longitude } = req.body;

    // Generate unique branch code
    const code = await generateBranchCode();

    const branch = await Branch.create({
      name,
      code,
      address,
      phoneNumber,
      email,
      latitude,
      longitude,
      isActive: true
    });

    res.status(201).json({
      status: 'success',
      data: branch
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({
      status: 'error',
      message: error.name === 'SequelizeValidationError' 
        ? error.errors[0].message 
        : 'Failed to create branch'
    });
  }
};

// Get all branches
const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.findAll({
      where: { isActive: true }
    });

    res.status(200).json({
      status: 'success',
      data: branches
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch branches'
    });
  }
};

// Get branch by ID
const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findByPk(id);

    if (!branch) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: branch
    });
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch branch'
    });
  }
};

// Update branch
const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phoneNumber, email, latitude, longitude, isActive } = req.body;

    const branch = await Branch.findByPk(id);
    if (!branch) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not found'
      });
    }

    await branch.update({
      name,
      address,
      phoneNumber,
      email,
      latitude,
      longitude,
      isActive
    });

    res.status(200).json({
      status: 'success',
      data: branch
    });
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({
      status: 'error',
      message: error.name === 'SequelizeValidationError' 
        ? error.errors[0].message 
        : 'Failed to update branch'
    });
  }
};

// Delete branch (soft delete by setting isActive to false)
const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findByPk(id);

    if (!branch) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not found'
      });
    }

    await branch.update({ isActive: false });

    res.status(200).json({
      status: 'success',
      message: 'Branch deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete branch'
    });
  }
};

module.exports = {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch
};
