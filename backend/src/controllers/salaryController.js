const { Salary, Employee, Benefit } = require('../models');
const { Op } = require('sequelize');

const calculateBPJS = async (baseSalary) => {
  try {
    console.log('Fetching BPJS benefits with base salary:', baseSalary);
    
    // Get only active BPJS benefits (is_active = 1)
    const bpjsBenefits = await Benefit.findAll({
      where: {
        code: {
          [Op.like]: 'BPJS_%'
        },
        is_active: 1
      },
      raw: true // Get plain objects
    });

    console.log('Found active BPJS benefits:', bpjsBenefits);

    const bpjsCalculations = {};
    
    // Initialize all BPJS amounts to 0 first
    const allBPJSCodes = ['BPJS_KES_COMPANY', 'BPJS_KES_EMPLOYEE', 
                         'BPJS_TK_COMPANY', 'BPJS_PENSIUN_COMPANY', 
                         'BPJS_PENSIUN_EMPLOYEE'];
    
    allBPJSCodes.forEach(code => {
      bpjsCalculations[code] = 0;
    });

    // Only calculate for active benefits
    for (const benefit of bpjsBenefits) {
      console.log('Processing benefit:', benefit.code, 'isFixed:', benefit.isFixed, 'multiplier:', benefit.multiplier);
      
      // Calculate amount based on whether it's fixed or percentage-based
      const amount = benefit.isFixed 
        ? benefit.fixedAmount 
        : (baseSalary * benefit.multiplier / 100);
      
      console.log('Calculated amount for', benefit.code, ':', amount);
      bpjsCalculations[benefit.code] = amount;
    }

    console.log('Final BPJS calculations:', bpjsCalculations);
    return bpjsCalculations;
  } catch (error) {
    console.error('Error calculating BPJS:', error);
    throw error;
  }
};

const salaryController = {
  // Create new salary record
  create: async (req, res) => {
    try {
      const { 
        employeeId, 
        tanggalGaji,
        allowances = {},
        deductions = {} 
      } = req.body;

      // Check if employee exists
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      // Check if salary for this month already exists
      const existingSalary = await Salary.findOne({
        where: {
          employeeId,
          tanggalGaji: {
            [Op.between]: [
              new Date(tanggalGaji).toISOString().substring(0, 7) + '-01',
              new Date(tanggalGaji).toISOString().substring(0, 7) + '-31'
            ]
          }
        }
      });

      if (existingSalary) {
        return res.status(400).json({
          success: false,
          message: 'Salary for this month already exists'
        });
      }

      // Calculate BPJS amounts using active benefits
      const bpjsAmounts = await calculateBPJS(employee.gaji_pokok);

      // Create initial salary record with BPJS calculations
      const salary = await Salary.create({
        employeeId,
        tanggalGaji,
        allowances,
        deductions,
        bpjsKesCompany: bpjsAmounts.BPJS_KES_COMPANY || 0,
        bpjsTkCompany: bpjsAmounts.BPJS_TK_COMPANY || 0,
        bpjsPensiunCompany: bpjsAmounts.BPJS_PENSIUN_COMPANY || 0,
        bpjsKesEmployee: bpjsAmounts.BPJS_KES_EMPLOYEE || 0,
        bpjsPensiunEmployee: bpjsAmounts.BPJS_PENSIUN_EMPLOYEE || 0,
        totalBpjsCompany: (bpjsAmounts.BPJS_KES_COMPANY || 0) + 
                         (bpjsAmounts.BPJS_TK_COMPANY || 0) + 
                         (bpjsAmounts.BPJS_PENSIUN_COMPANY || 0),
        totalBpjsEmployee: (bpjsAmounts.BPJS_KES_EMPLOYEE || 0) + 
                          (bpjsAmounts.BPJS_PENSIUN_EMPLOYEE || 0),
        createdBy: req.user.id
      });

      // Fetch the updated salary record with calculated values
      const updatedSalary = await Salary.findByPk(salary.id, {
        include: [{
          model: Employee,
          attributes: ['namaLengkap', 'nip', 'position', 'gaji_pokok']
        }]
      });

      res.status(201).json({
        success: true,
        data: updatedSalary
      });
    } catch (error) {
      console.error('Error creating salary:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get all salary records with pagination
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, search, startDate, endDate } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      
      // Add date range filter if provided
      if (startDate && endDate) {
        whereClause.tanggalGaji = {
          [Op.between]: [startDate, endDate]
        };
      }

      // Add search filter if provided
      if (search) {
        whereClause = {
          ...whereClause,
          [Op.or]: [
            { '$Employee.namaLengkap$': { [Op.iLike]: `%${search}%` } },
            { '$Employee.nip$': { [Op.iLike]: `%${search}%` } }
          ]
        };
      }

      const { count, rows } = await Salary.findAndCountAll({
        where: whereClause,
        include: [{
          model: Employee,
          attributes: ['namaLengkap', 'nip', 'position', 'gaji_pokok']
        }],
        order: [['tanggalGaji', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Error in getting salaries:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve salary records'
      });
    }
  },

  // Get salary by ID
  getById: async (req, res) => {
    try {
      const salary = await Salary.findByPk(req.params.id, {
        include: [{
          model: Employee,
          attributes: ['namaLengkap', 'nip', 'position', 'gaji_pokok']
        }]
      });

      if (!salary) {
        return res.status(404).json({
          success: false,
          message: 'Salary record not found'
        });
      }

      res.json({
        success: true,
        data: salary
      });
    } catch (error) {
      console.error('Error in getting salary:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve salary record'
      });
    }
  },

  // Update salary record
  update: async (req, res) => {
    try {
      const { allowances, deductions } = req.body;
      const salary = await Salary.findByPk(req.params.id);

      if (!salary) {
        return res.status(404).json({
          success: false,
          message: 'Salary record not found'
        });
      }

      // Update only manual allowances and deductions
      await salary.update({
        allowances: allowances || salary.allowances,
        deductions: deductions || salary.deductions
      });

      res.json({
        success: true,
        data: salary
      });
    } catch (error) {
      console.error('Error in updating salary:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update salary record'
      });
    }
  },

  // Delete salary record
  delete: async (req, res) => {
    try {
      const salary = await Salary.findByPk(req.params.id);

      if (!salary) {
        return res.status(404).json({
          success: false,
          message: 'Salary record not found'
        });
      }

      await salary.destroy();

      res.json({
        success: true,
        message: 'Salary record deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleting salary:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete salary record'
      });
    }
  }
};

module.exports = salaryController;
