'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'branch_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'branches',
        key: 'id'
      },
      after: 'is_active'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'branch_id');
  }
};
