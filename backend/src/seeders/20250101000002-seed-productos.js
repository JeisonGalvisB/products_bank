/**
 * Seeder: Insert product types
 * Products: Credito de Consumo (ID: 1), Libranza Libre Inversión (ID: 2), Tarjeta de Credito (ID: 3)
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('productos_tipos', [
      {
        id: 1,
        nombre: 'Credito de Consumo',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        nombre: 'Libranza Libre Inversión',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        nombre: 'Tarjeta de Credito',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('productos_tipos', null, {});
  }
};