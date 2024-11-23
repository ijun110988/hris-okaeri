'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if table exists
      const tableExists = await queryInterface.showAllTables()
        .then(tables => tables.includes('employees'));
      
      if (!tableExists) {
        await queryInterface.createTable('employees', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          branch_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'branches',
              key: 'id'
            }
          },
          name: {
            type: Sequelize.STRING,
            allowNull: false
          },
          email: {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
          },
          phone_number: {
            type: Sequelize.STRING,
            allowNull: true
          },
          address: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          gaji_pokok: {
            type: Sequelize.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
          },
          is_active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
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

        // Add indexes only if table was just created
        await queryInterface.addIndex('employees', ['branch_id'], {
          name: 'employees_branch_id'
        });
        await queryInterface.addIndex('employees', ['is_active'], {
          name: 'employees_is_active'
        });
      }
    } catch (error) {
      console.error('Error in create-employees migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableExists = await queryInterface.showAllTables()
        .then(tables => tables.includes('employees'));
      
      if (tableExists) {
        // Remove indexes first if they exist
        try {
          await queryInterface.removeIndex('employees', 'employees_branch_id');
        } catch (error) {
          console.log('Index employees_branch_id may not exist');
        }
        
        try {
          await queryInterface.removeIndex('employees', 'employees_is_active');
        } catch (error) {
          console.log('Index employees_is_active may not exist');
        }
        
        // Then drop the table
        await queryInterface.dropTable('employees');
      }
    } catch (error) {
      console.error('Error in create-employees down migration:', error);
      throw error;
    }
  }
};
