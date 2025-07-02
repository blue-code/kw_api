'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('files', 'group_id', {
      type: Sequelize.STRING,
      allowNull: true, // group_id는 필수가 아님
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('files', 'group_id');
  }
};