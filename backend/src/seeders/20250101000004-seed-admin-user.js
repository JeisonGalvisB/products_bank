/**
 * Seeder: Insert initial admin user
 * User: admin@productsbank.com / Admin123!
 */

'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash password
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    await queryInterface.bulkInsert('usuarios', [
      {
        id: 1,
        nombre: 'Administrador',
        email: 'admin@productsbank.com',
        password: hashedPassword,
        rolId: 1, // Admin role
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', {
      email: 'admin@productsbank.com'
    });
  }
};