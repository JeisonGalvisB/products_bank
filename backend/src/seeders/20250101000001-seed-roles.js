/**
 * Seeder: Insert initial roles
 * Roles: Administrador (ID: 1), Asesor (ID: 2)
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      {
        id: 1,
        nombre: 'Administrador',
        descripcion: 'Acceso total al sistema, gestión de usuarios y ventas',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        nombre: 'Asesor',
        descripcion: 'Gestión de ventas propias, sin acceso a módulo de usuarios',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};