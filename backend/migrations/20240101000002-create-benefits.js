'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('benefits', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      multiplier: {
        type: Sequelize.DECIMAL(5, 3),
        allowNull: false,
        comment: 'Percentage multiplier (e.g., 4.000 for 4%)'
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add initial BPJS benefit records
    await queryInterface.bulkInsert('benefits', [
      {
        name: 'BPJS Kesehatan Company Contribution',
        code: 'BPJS_KES_COMPANY',
        multiplier: 4.000,
        description: 'Company contribution for BPJS Kesehatan (4%)',
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'BPJS TK Company Contribution',
        code: 'BPJS_TK_COMPANY',
        multiplier: 5.700,
        description: 'Company contribution for BPJS TK (5.7%)',
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'BPJS Pensiun Company Contribution',
        code: 'BPJS_PENSIUN_COMPANY',
        multiplier: 3.000,
        description: 'Company contribution for BPJS Pensiun (3%)',
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'BPJS Kesehatan Employee Deduction',
        code: 'BPJS_KES_EMPLOYEE',
        multiplier: 1.000,
        description: 'Employee deduction for BPJS Kesehatan (1%)',
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'BPJS Pensiun Employee Deduction',
        code: 'BPJS_PENSIUN_EMPLOYEE',
        multiplier: 1.000,
        description: 'Employee deduction for BPJS Pensiun (1%)',
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('benefits');
  }
};
