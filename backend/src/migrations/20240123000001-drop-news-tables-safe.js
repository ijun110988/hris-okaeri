'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if tables exist before dropping
    const tables = await queryInterface.showAllTables();
    
    if (tables.includes('news_recipients')) {
      // Drop foreign key constraints first
      await queryInterface.sequelize.query(
        'ALTER TABLE news_recipients DROP FOREIGN KEY IF EXISTS news_recipients_news_id_foreign;'
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE news_recipients DROP FOREIGN KEY IF EXISTS news_recipients_recipient_id_foreign;'
      );
      // Drop news_recipients table
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS news_recipients;');
    }

    if (tables.includes('news')) {
      // Drop foreign key constraints first
      await queryInterface.sequelize.query(
        'ALTER TABLE news DROP FOREIGN KEY IF EXISTS news_created_by_foreign;'
      );
      // Drop news table
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS news;');
    }
  },

  async down(queryInterface, Sequelize) {
    // No down migration needed as we're removing deprecated tables
  }
};
