'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('salaries');

    if (!tableInfo.tunjangan_kendaraan) {
      await queryInterface.addColumn('salaries', 'tunjangan_kendaraan', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      });
    }

    if (!tableInfo.tunjangan_pulsa) {
      await queryInterface.addColumn('salaries', 'tunjangan_pulsa', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      });
    }

    if (!tableInfo.potongan_bpjs_kesehatan) {
      await queryInterface.addColumn('salaries', 'potongan_bpjs_kesehatan', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      });
    }

    if (!tableInfo.potongan_bpjs_pensiun) {
      await queryInterface.addColumn('salaries', 'potongan_bpjs_pensiun', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      });
    }

    if (!tableInfo.total_tunjangan_tetap) {
      await queryInterface.addColumn('salaries', 'total_tunjangan_tetap', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      });
    }

    if (!tableInfo.total_tunjangan_manual) {
      await queryInterface.addColumn('salaries', 'total_tunjangan_manual', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      });
    }

    if (!tableInfo.total_potongan) {
      await queryInterface.addColumn('salaries', 'total_potongan', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('salaries');

    if (tableInfo.tunjangan_kendaraan) {
      await queryInterface.removeColumn('salaries', 'tunjangan_kendaraan');
    }
    if (tableInfo.tunjangan_pulsa) {
      await queryInterface.removeColumn('salaries', 'tunjangan_pulsa');
    }
    if (tableInfo.potongan_bpjs_kesehatan) {
      await queryInterface.removeColumn('salaries', 'potongan_bpjs_kesehatan');
    }
    if (tableInfo.potongan_bpjs_pensiun) {
      await queryInterface.removeColumn('salaries', 'potongan_bpjs_pensiun');
    }
    if (tableInfo.total_tunjangan_tetap) {
      await queryInterface.removeColumn('salaries', 'total_tunjangan_tetap');
    }
    if (tableInfo.total_tunjangan_manual) {
      await queryInterface.removeColumn('salaries', 'total_tunjangan_manual');
    }
    if (tableInfo.total_potongan) {
      await queryInterface.removeColumn('salaries', 'total_potongan');
    }
  }
};
