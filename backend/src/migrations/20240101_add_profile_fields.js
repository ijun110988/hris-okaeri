'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Add email column
      await queryInterface.addColumn(
        'users',
        'email',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      // Add department column
      await queryInterface.addColumn(
        'users',
        'department',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      // Add position column
      await queryInterface.addColumn(
        'users',
        'position',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      // Add nik column
      await queryInterface.addColumn(
        'users',
        'nik',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('users', 'email', { transaction });
      await queryInterface.removeColumn('users', 'department', { transaction });
      await queryInterface.removeColumn('users', 'position', { transaction });
      await queryInterface.removeColumn('users', 'nik', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
