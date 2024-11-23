'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if table exists
      const tableExists = await queryInterface.showAllTables()
        .then(tables => tables.includes('salaries'));
      
      if (!tableExists) {
        // Create salaries table if it doesn't exist
        await queryInterface.createTable('salaries', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          employee_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'employees',
              key: 'id'
            }
          },
          period: {
            type: Sequelize.DATE,
            allowNull: false
          },
          gaji_pokok: {
            type: Sequelize.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
          },
          tunjangan_bpjs_kesehatan: {
            type: Sequelize.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
          },
          tunjangan_bpjs_tk: {
            type: Sequelize.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
          },
          tunjangan_bpjs_pensiun: {
            type: Sequelize.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
          },
          created_by: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            }
          }
        });

        // Add indexes
        await queryInterface.addIndex('salaries', ['employee_id'], {
          name: 'salaries_employee_id'
        });
        await queryInterface.addIndex('salaries', ['period'], {
          name: 'salaries_period'
        });
      }
    } catch (error) {
      console.error('Error in create-salaries migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableExists = await queryInterface.showAllTables()
        .then(tables => tables.includes('salaries'));
      
      if (tableExists) {
        // Remove indexes first if they exist
        try {
          await queryInterface.removeIndex('salaries', 'salaries_employee_id');
        } catch (error) {
          console.log('Index salaries_employee_id may not exist');
        }
        
        try {
          await queryInterface.removeIndex('salaries', 'salaries_period');
        } catch (error) {
          console.log('Index salaries_period may not exist');
        }
        
        // Then drop the table
        await queryInterface.dropTable('salaries');
      }
    } catch (error) {
      console.error('Error in create-salaries down migration:', error);
      throw error;
    }
  }
};
