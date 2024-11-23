'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Drop existing timestamp columns if they exist
      try {
        await queryInterface.removeColumn('branches', 'created_at');
        await queryInterface.removeColumn('branches', 'updated_at');
      } catch (error) {
        console.log('Timestamp columns may not exist, continuing...');
      }

      // Add timestamp columns with correct configuration
      await queryInterface.addColumn('branches', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });

      await queryInterface.addColumn('branches', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      });

      // Check if phone_number column exists
      try {
        await queryInterface.describeTable('branches').then(tableDefinition => {
          if (!tableDefinition.phone_number) {
            return queryInterface.addColumn('branches', 'phone_number', {
              type: Sequelize.STRING,
              allowNull: true
            });
          }
        });
      } catch (error) {
        console.log('Error checking phone_number column:', error);
      }

      // Check if email column exists
      try {
        await queryInterface.describeTable('branches').then(tableDefinition => {
          if (!tableDefinition.email) {
            return queryInterface.addColumn('branches', 'email', {
              type: Sequelize.STRING,
              allowNull: true
            });
          }
        });
      } catch (error) {
        console.log('Error checking email column:', error);
      }
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove columns if they exist
      try {
        await queryInterface.removeColumn('branches', 'phone_number');
        await queryInterface.removeColumn('branches', 'email');
        await queryInterface.removeColumn('branches', 'created_at');
        await queryInterface.removeColumn('branches', 'updated_at');
      } catch (error) {
        console.log('Some columns may not exist, continuing...');
      }

      // Add back the original timestamp columns
      await queryInterface.addColumn('branches', 'created_at', {
        type: Sequelize.DATE,
        allowNull: true
      });

      await queryInterface.addColumn('branches', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
    } catch (error) {
      console.error('Migration rollback error:', error);
      throw error;
    }
  }
};
