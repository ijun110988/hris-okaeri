'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the existing unique constraint on code
    await queryInterface.removeConstraint('benefits', 'benefits_code_key');

    // Add new partial unique index
    await queryInterface.addIndex('benefits', ['code', 'is_active'], {
      unique: true,
      where: {
        is_active: true
      },
      name: 'benefits_active_code_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the partial unique index
    await queryInterface.removeIndex('benefits', 'benefits_active_code_unique');

    // Restore original unique constraint on code
    await queryInterface.addConstraint('benefits', {
      fields: ['code'],
      type: 'unique',
      name: 'benefits_code_key'
    });
  }
};
