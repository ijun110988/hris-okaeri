const { Benefit } = require('../models');
const { Op } = require('sequelize');

// Create new benefit
const createBenefit = async (req, res) => {
  try {
    const {
      name,
      code,
      type = 'ALLOWANCE',
      multiplier = 0,
      isFixed = false,
      fixedAmount = 0,
      description,
      isActive = true
    } = req.body;

    // Check if active benefit with same code exists
    const existingBenefit = await Benefit.findOne({
      where: {
        code,
        isActive: true
      }
    });

    if (existingBenefit) {
      return res.status(400).json({
        success: false,
        message: 'An active benefit with this code already exists'
      });
    }

    const benefit = await Benefit.create({
      name,
      code,
      type,
      multiplier,
      isFixed,
      fixedAmount,
      description,
      isActive,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: benefit
    });
  } catch (error) {
    console.error('Error creating benefit:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all benefits
const getAllBenefits = async (req, res) => {
  try {
    const { showInactive = false } = req.query;
    
    const where = showInactive ? {} : { isActive: true };
    
    const benefits = await Benefit.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: benefits
    });
  } catch (error) {
    console.error('Error fetching benefits:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get benefit by ID
const getBenefitById = async (req, res) => {
  try {
    const benefit = await Benefit.findByPk(req.params.id);

    if (!benefit) {
      return res.status(404).json({
        success: false,
        message: 'Benefit not found'
      });
    }

    res.json({
      success: true,
      data: benefit
    });
  } catch (error) {
    console.error('Error fetching benefit:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update benefit
const updateBenefit = async (req, res) => {
  try {
    const {
      name,
      code,
      type,
      multiplier,
      isFixed,
      fixedAmount,
      description,
      isActive
    } = req.body;

    const benefit = await Benefit.findByPk(req.params.id);

    if (!benefit) {
      return res.status(404).json({
        success: false,
        message: 'Benefit not found'
      });
    }

    // Check if updating code and new code already exists
    if (code && code !== benefit.code) {
      const existingBenefit = await Benefit.findOne({
        where: {
          code,
          isActive: true,
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingBenefit) {
        return res.status(400).json({
          success: false,
          message: 'An active benefit with this code already exists'
        });
      }
    }

    await benefit.update({
      name,
      code,
      type,
      multiplier,
      isFixed,
      fixedAmount,
      description,
      isActive
    });

    res.json({
      success: true,
      data: benefit
    });
  } catch (error) {
    console.error('Error updating benefit:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete benefit
const deleteBenefit = async (req, res) => {
  try {
    const benefit = await Benefit.findByPk(req.params.id);

    if (!benefit) {
      return res.status(404).json({
        success: false,
        message: 'Benefit not found'
      });
    }

    // Soft delete by setting isActive to false
    await benefit.update({ isActive: false });

    res.json({
      success: true,
      message: 'Benefit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting benefit:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createBenefit,
  getAllBenefits,
  getBenefitById,
  updateBenefit,
  deleteBenefit
};
