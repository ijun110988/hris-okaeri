'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop old columns
    await queryInterface.removeColumn('salaries', 'tunjangan_bpjs_kesehatan');
    await queryInterface.removeColumn('salaries', 'tunjangan_bpjs_tk');
    await queryInterface.removeColumn('salaries', 'tunjangan_bpjs_pensiun');
    await queryInterface.removeColumn('salaries', 'tunjangan_kendaraan');
    await queryInterface.removeColumn('salaries', 'tunjangan_pulsa');
    await queryInterface.removeColumn('salaries', 'tunjangan_lain');
    await queryInterface.removeColumn('salaries', 'potongan_bpjs_kesehatan');
    await queryInterface.removeColumn('salaries', 'potongan_bpjs_pensiun');
    await queryInterface.removeColumn('salaries', 'total_tunjangan_tetap');
    await queryInterface.removeColumn('salaries', 'total_tunjangan_manual');
    await queryInterface.removeColumn('salaries', 'total_potongan');
    await queryInterface.removeColumn('salaries', 'total_gaji');

    // Add new BPJS columns
    await queryInterface.addColumn('salaries', 'bpjs_kes_company', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      after: 'tanggal_gaji'
    });

    await queryInterface.addColumn('salaries', 'bpjs_tk_company', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      after: 'bpjs_kes_company'
    });

    await queryInterface.addColumn('salaries', 'bpjs_pensiun_company', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      after: 'bpjs_tk_company'
    });

    await queryInterface.addColumn('salaries', 'bpjs_kes_employee', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      after: 'bpjs_pensiun_company'
    });

    await queryInterface.addColumn('salaries', 'bpjs_pensiun_employee', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      after: 'bpjs_kes_employee'
    });

    // Add allowances and deductions JSON columns
    await queryInterface.addColumn('salaries', 'allowances', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {},
      after: 'bpjs_pensiun_employee'
    });

    await queryInterface.addColumn('salaries', 'deductions', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {},
      after: 'allowances'
    });

    // Add calculated totals
    await queryInterface.addColumn('salaries', 'total_bpjs_company', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      after: 'deductions'
    });

    await queryInterface.addColumn('salaries', 'total_bpjs_employee', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      after: 'total_bpjs_company'
    });

    await queryInterface.addColumn('salaries', 'total_allowances', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      after: 'total_bpjs_employee'
    });

    await queryInterface.addColumn('salaries', 'total_deductions', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      after: 'total_allowances'
    });

    await queryInterface.addColumn('salaries', 'take_home_pay', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      after: 'total_deductions'
    });

    // Add status and approval columns
    await queryInterface.addColumn('salaries', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'DRAFT',
      after: 'take_home_pay'
    });

    await queryInterface.addColumn('salaries', 'approved_at', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'status'
    });

    await queryInterface.addColumn('salaries', 'approved_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      after: 'approved_at'
    });

    await queryInterface.addColumn('salaries', 'paid_at', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'approved_by'
    });

    await queryInterface.addColumn('salaries', 'paid_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      after: 'paid_at'
    });

    await queryInterface.addColumn('salaries', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'paid_by'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove new columns
    await queryInterface.removeColumn('salaries', 'bpjs_kes_company');
    await queryInterface.removeColumn('salaries', 'bpjs_tk_company');
    await queryInterface.removeColumn('salaries', 'bpjs_pensiun_company');
    await queryInterface.removeColumn('salaries', 'bpjs_kes_employee');
    await queryInterface.removeColumn('salaries', 'bpjs_pensiun_employee');
    await queryInterface.removeColumn('salaries', 'allowances');
    await queryInterface.removeColumn('salaries', 'deductions');
    await queryInterface.removeColumn('salaries', 'total_bpjs_company');
    await queryInterface.removeColumn('salaries', 'total_bpjs_employee');
    await queryInterface.removeColumn('salaries', 'total_allowances');
    await queryInterface.removeColumn('salaries', 'total_deductions');
    await queryInterface.removeColumn('salaries', 'take_home_pay');
    await queryInterface.removeColumn('salaries', 'status');
    await queryInterface.removeColumn('salaries', 'approved_at');
    await queryInterface.removeColumn('salaries', 'approved_by');
    await queryInterface.removeColumn('salaries', 'paid_at');
    await queryInterface.removeColumn('salaries', 'paid_by');
    await queryInterface.removeColumn('salaries', 'notes');

    // Restore old columns
    await queryInterface.addColumn('salaries', 'tunjangan_bpjs_kesehatan', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('salaries', 'tunjangan_bpjs_tk', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('salaries', 'tunjangan_bpjs_pensiun', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('salaries', 'tunjangan_kendaraan', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('salaries', 'tunjangan_pulsa', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('salaries', 'tunjangan_lain', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('salaries', 'potongan_bpjs_kesehatan', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('salaries', 'potongan_bpjs_pensiun', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('salaries', 'total_tunjangan_tetap', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('salaries', 'total_tunjangan_manual', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('salaries', 'total_potongan', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('salaries', 'total_gaji', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    });
  }
};
