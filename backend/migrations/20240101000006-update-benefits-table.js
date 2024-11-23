'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('benefits');

    // Add benefit_type if it doesn't exist
    if (!tableInfo.benefit_type) {
      await queryInterface.addColumn('benefits', 'benefit_type', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'ALLOWANCE',
        after: 'code'
      });
    }

    // Add is_fixed if it doesn't exist
    if (!tableInfo.is_fixed) {
      await queryInterface.addColumn('benefits', 'is_fixed', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        after: 'multiplier'
      });
    }

    // Add fixed_amount if it doesn't exist
    if (!tableInfo.fixed_amount) {
      await queryInterface.addColumn('benefits', 'fixed_amount', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        after: 'is_fixed'
      });
    }

    // Modify existing columns
    await queryInterface.changeColumn('benefits', 'multiplier', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.changeColumn('benefits', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Insert default BPJS benefits
    const defaultBenefits = [
      {
        name: 'BPJS Kesehatan Perusahaan',
        code: 'BPJS_KES_COMPANY',
        benefit_type: 'BPJS_COMPANY',
        multiplier: 4.00,
        is_fixed: false,
        fixed_amount: 0,
        description: 'Kontribusi BPJS Kesehatan dari perusahaan (4%)',
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'BPJS Ketenagakerjaan Perusahaan',
        code: 'BPJS_TK_COMPANY',
        benefit_type: 'BPJS_COMPANY',
        multiplier: 5.70,
        is_fixed: false,
        fixed_amount: 0,
        description: 'Kontribusi BPJS Ketenagakerjaan dari perusahaan (5.7%)',
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'BPJS Pensiun Perusahaan',
        code: 'BPJS_PENSIUN_COMPANY',
        benefit_type: 'BPJS_COMPANY',
        multiplier: 3.00,
        is_fixed: false,
        fixed_amount: 0,
        description: 'Kontribusi BPJS Pensiun dari perusahaan (3%)',
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'BPJS Kesehatan Karyawan',
        code: 'BPJS_KES_EMPLOYEE',
        benefit_type: 'BPJS_EMPLOYEE',
        multiplier: 1.00,
        is_fixed: false,
        fixed_amount: 0,
        description: 'Potongan BPJS Kesehatan karyawan (1%)',
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'BPJS Pensiun Karyawan',
        code: 'BPJS_PENSIUN_EMPLOYEE',
        benefit_type: 'BPJS_EMPLOYEE',
        multiplier: 1.00,
        is_fixed: false,
        fixed_amount: 0,
        description: 'Potongan BPJS Pensiun karyawan (1%)',
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    try {
      await queryInterface.bulkInsert('benefits', defaultBenefits);
    } catch (error) {
      console.log('Default benefits may already exist:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove default benefits
    await queryInterface.bulkDelete('benefits', {
      code: [
        'BPJS_KES_COMPANY',
        'BPJS_TK_COMPANY',
        'BPJS_PENSIUN_COMPANY',
        'BPJS_KES_EMPLOYEE',
        'BPJS_PENSIUN_EMPLOYEE'
      ]
    });

    // Remove columns
    const tableInfo = await queryInterface.describeTable('benefits');

    if (tableInfo.benefit_type) {
      await queryInterface.removeColumn('benefits', 'benefit_type');
    }
    if (tableInfo.is_fixed) {
      await queryInterface.removeColumn('benefits', 'is_fixed');
    }
    if (tableInfo.fixed_amount) {
      await queryInterface.removeColumn('benefits', 'fixed_amount');
    }

    // Revert column changes
    await queryInterface.changeColumn('benefits', 'multiplier', {
      type: Sequelize.DECIMAL(5, 3),
      allowNull: false
    });

    await queryInterface.changeColumn('benefits', 'description', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
