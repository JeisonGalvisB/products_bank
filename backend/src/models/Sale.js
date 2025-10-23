/**
 * Sale Model
 * Represents financial product sales
 * Conditional fields: franquiciaId (only for credit cards), tasa (only for credits/payrolls)
 */

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Sale = sequelize.define('Sale', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    productoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos_tipos',
        key: 'id'
      }
    },
    cupoSolicitado: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0.01,
        isDecimal: true
      }
    },
    franquiciaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'franquicias',
        key: 'id'
      }
    },
    tasa: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
        isDecimal: true
      }
    },
    estado: {
      type: DataTypes.ENUM('Abierto', 'En Proceso', 'Finalizado'),
      allowNull: false,
      defaultValue: 'Abierto'
    },
    usuarioCreadorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    usuarioActualizadorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    }
  }, {
    tableName: 'ventas',
    timestamps: true
  });

  // Define associations
  Sale.associate = function(models) {
    // A sale belongs to a product
    Sale.belongsTo(models.Product, {
      foreignKey: 'productoId',
      as: 'producto'
    });

    // A sale belongs to a franchise (nullable)
    Sale.belongsTo(models.Franchise, {
      foreignKey: 'franquiciaId',
      as: 'franquicia'
    });

    // A sale belongs to a creator user
    Sale.belongsTo(models.User, {
      foreignKey: 'usuarioCreadorId',
      as: 'usuarioCreador'
    });

    // A sale belongs to an updater user
    Sale.belongsTo(models.User, {
      foreignKey: 'usuarioActualizadorId',
      as: 'usuarioActualizador'
    });
  };

  return Sale;
};