'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('users', 'branch_id', 'branchId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('users', 'branchId', 'branch_id');
  }
};
