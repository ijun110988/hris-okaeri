const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nip: {
    type: DataTypes.STRING(20),
    unique: 'idx_nip',
    validate: {
      notEmpty: true
    }
  },
  namaLengkap: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  tempatLahir: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  tanggalLahir: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  alamat: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  jenisKelamin: {
    type: DataTypes.ENUM('L', 'P'),
    allowNull: false
  },
  agama: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  statusNikah: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  pendidikan: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  position: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  gaji_pokok: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  branchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'branches',
      key: 'id'
    }
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
  tableName: 'employees',
  timestamps: true,
  underscored: true
});

// Define associations
Employee.associate = function(models) {
  Employee.belongsTo(models.User, { 
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  
  Employee.belongsTo(models.Branch, {
    foreignKey: 'branchId'
  });
  
  Employee.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
  
  Employee.hasMany(models.Salary, {
    foreignKey: 'employeeId'
  });
};

// Define hooks
Employee.addHook('beforeCreate', async (employee) => {
  const timestamp = Date.now().toString().slice(-4);
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  employee.nip = `${employee.branchId}${timestamp}${randomNum}`;
});

module.exports = Employee;
