const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');

const Salary = sequelize.define('Salary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  tanggalGaji: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  // Calculated BPJS amounts
  bpjsKesCompany: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  bpjsTkCompany: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  bpjsPensiunCompany: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  bpjsKesEmployee: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  bpjsPensiunEmployee: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  // Manual allowances
  allowances: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '{}',
    get() {
      const rawValue = this.getDataValue('allowances');
      try {
        return rawValue ? JSON.parse(rawValue) : {};
      } catch (error) {
        console.error('Error parsing allowances:', error);
        return {};
      }
    },
    set(value) {
      this.setDataValue('allowances', JSON.stringify(value || {}));
    }
  },
  // Manual deductions
  deductions: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '{}',
    get() {
      const rawValue = this.getDataValue('deductions');
      try {
        return rawValue ? JSON.parse(rawValue) : {};
      } catch (error) {
        console.error('Error parsing deductions:', error);
        return {};
      }
    },
    set(value) {
      this.setDataValue('deductions', JSON.stringify(value || {}));
    }
  },
  // Calculated totals
  totalBpjsCompany: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  totalBpjsEmployee: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  totalAllowance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  totalDeduction: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  netSalary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'salaries',
  hooks: {
    beforeCreate: async (salary) => {
      await calculateSalary(salary);
    },
    beforeUpdate: async (salary) => {
      await calculateSalary(salary);
    }
  }
});

// Define associations
Salary.associate = function(models) {
  Salary.belongsTo(models.Employee, {
    foreignKey: 'employeeId'
  });
  
  Salary.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
};

// Helper function to calculate salary components
async function calculateSalary(salary) {
  // Get employee data
  const employee = await sequelize.models.Employee.findByPk(salary.employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Get only active benefits
  const benefits = await sequelize.models.Benefit.findAll({
    where: {
      [Op.and]: [
        // Only include active benefits
        { is_active: 1 },
        {
          type: {
            [Op.in]: ['BPJS_COMPANY', 'BPJS_EMPLOYEE', 'ALLOWANCE', 'DEDUCTION']
          }
        }
      ]
    }
  });

  const gajiPokok = employee.gaji_pokok;
  
  // Reset all benefit values to 0
  salary.bpjsKesCompany = 0;
  salary.bpjsKesEmployee = 0;
  salary.bpjsTkCompany = 0;
  salary.bpjsPensiunCompany = 0;
  salary.bpjsPensiunEmployee = 0;
  salary.allowances = salary.allowances || {};
  salary.deductions = salary.deductions || {};

  // Calculate amounts for each benefit
  for (const benefit of benefits) {
    let amount;
    if (benefit.isFixed) {
      // If benefit is fixed, use the fixedAmount directly
      amount = benefit.fixedAmount;
    } else {
      // For percentage-based benefits
      switch (benefit.type) {
        case 'BPJS_COMPANY':
        case 'BPJS_EMPLOYEE':
          // BPJS calculations are always based on gaji_pokok
          amount = gajiPokok * benefit.multiplier / 100;
          break;
        case 'ALLOWANCE':
          amount = gajiPokok * benefit.multiplier / 100;
          break;
        case 'DEDUCTION':
          amount = gajiPokok * benefit.multiplier / 100;
          break;
        default:
          amount = 0;
      }
    }

    // Apply the calculated amount to the appropriate field
    switch (benefit.code) {
      case 'BPJS_KES_COMPANY':
        salary.bpjsKesCompany = amount;
        break;
      case 'BPJS_KES_EMPLOYEE':
        salary.bpjsKesEmployee = amount;
        break;
      case 'BPJS_TK_COMPANY':
        salary.bpjsTkCompany = amount;
        break;
      case 'BPJS_PENSIUN_COMPANY':
        salary.bpjsPensiunCompany = amount;
        break;
      case 'BPJS_PENSIUN_EMPLOYEE':
        salary.bpjsPensiunEmployee = amount;
        break;
      default:
        if (benefit.type === 'ALLOWANCE') {
          salary.allowances[benefit.code] = amount;
        } else if (benefit.type === 'DEDUCTION') {
          salary.deductions[benefit.code] = amount;
        }
    }
  }

  // Calculate totals
  salary.totalBpjsCompany = 
    parseFloat(salary.bpjsKesCompany || 0) + 
    parseFloat(salary.bpjsTkCompany || 0) + 
    parseFloat(salary.bpjsPensiunCompany || 0);

  salary.totalBpjsEmployee = 
    parseFloat(salary.bpjsKesEmployee || 0) + 
    parseFloat(salary.bpjsPensiunEmployee || 0);

  // Calculate total allowances
  salary.totalAllowance = Object.values(salary.allowances)
    .reduce((sum, amount) => sum + parseFloat(amount || 0), 0);

  // Calculate total deductions
  salary.totalDeduction = Object.values(salary.deductions)
    .reduce((sum, amount) => sum + parseFloat(amount || 0), 0);

  // Calculate net salary
  salary.netSalary = gajiPokok + 
    salary.totalAllowance - 
    salary.totalDeduction - 
    salary.totalBpjsEmployee;
}

module.exports = Salary;
