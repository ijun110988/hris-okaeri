'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if position column exists
      const tableInfo = await queryInterface.describeTable('employees');
      if (!tableInfo.position) {
        // Add position column first
        await queryInterface.addColumn('employees', 'position', {
          type: Sequelize.STRING,
          allowNull: true
        });
      }

      // Check if gaji_pokok column exists
      if (!tableInfo.gaji_pokok) {
        await queryInterface.addColumn('employees', 'gaji_pokok', {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
          after: 'position'
        });
      }
    } catch (error) {
      console.error('Error in add-gaji-pokok-to-employees migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('employees');
      
      // Remove gaji_pokok first if it exists
      if (tableInfo.gaji_pokok) {
        await queryInterface.removeColumn('employees', 'gaji_pokok');
      }
      
      // Then remove position if it exists
      if (tableInfo.position) {
        await queryInterface.removeColumn('employees', 'position');
      }
    } catch (error) {
      console.error('Error in add-gaji-pokok-to-employees down migration:', error);
      throw error;
    }
  }
};
