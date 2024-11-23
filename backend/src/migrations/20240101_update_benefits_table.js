'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Drop existing columns if they exist
      await queryInterface.removeColumn('benefits', 'amount', { transaction }).catch(() => {});
      
      // Add new columns
      await queryInterface.addColumn(
        'benefits',
        'multiplier',
        {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 0
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'benefits',
        'is_fixed',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'benefits',
        'fixed_amount',
        {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'benefits',
        'created_by',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
        },
        { transaction }
      );

      // Add unique index
      await queryInterface.addIndex(
        'benefits',
        ['code', 'is_active'],
        {
          unique: true,
          where: {
            is_active: true
          },
          transaction
        }
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
      // Remove columns
      await queryInterface.removeColumn('benefits', 'multiplier', { transaction });
      await queryInterface.removeColumn('benefits', 'is_fixed', { transaction });
      await queryInterface.removeColumn('benefits', 'fixed_amount', { transaction });
      await queryInterface.removeColumn('benefits', 'created_by', { transaction });
      
      // Remove index
      await queryInterface.removeIndex('benefits', ['code', 'is_active'], { transaction });
      
      // Add back the amount column
      await queryInterface.addColumn(
        'benefits',
        'amount',
        {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0
        },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
