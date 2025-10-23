/**
 * Migration: Create ventas (sales) table
 * Depends on: productos_tipos, franquicias, usuarios
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ventas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      productoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'productos_tipos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      cupoSolicitado: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        validate: {
          min: 0.01
        }
      },
      franquiciaId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'franquicias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      tasa: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: 0,
          max: 100
        }
      },
      estado: {
        type: Sequelize.ENUM('Abierto', 'En Proceso', 'Finalizado'),
        allowNull: false,
        defaultValue: 'Abierto'
      },
      usuarioCreadorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      usuarioActualizadorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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

    // Add indexes for performance
    await queryInterface.addIndex('ventas', ['productoId']);
    await queryInterface.addIndex('ventas', ['usuarioCreadorId']);
    await queryInterface.addIndex('ventas', ['estado']);
    await queryInterface.addIndex('ventas', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ventas');
  }
};