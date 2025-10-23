/**
 * Seeder: Insert franchises
 * Franchises: AMEX (ID: 1), VISA (ID: 2), MASTERCARD (ID: 3)
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('franquicias', [
      {
        id: 1,
        nombre: 'AMEX',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        nombre: 'VISA',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        nombre: 'MASTERCARD',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('franquicias', null, {});
  }
};