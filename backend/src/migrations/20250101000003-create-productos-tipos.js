/**
 * Migration: Create productos_tipos (product types) table
 * Types: Credito de Consumo, Libranza Libre Inversión, Tarjeta de Credito
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('productos_tipos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add index on nombre
    await queryInterface.addIndex('productos_tipos', ['nombre']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('productos_tipos');
  }
};