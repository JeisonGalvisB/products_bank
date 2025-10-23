/**
 * Product Model
 * Represents financial product types
 * (Credito de Consumo, Libranza Libre Inversión, Tarjeta de Credito)
 */

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 100]
      }
    }
  }, {
    tableName: 'productos_tipos',
    timestamps: true
  });

  // Define associations
  Product.associate = function(models) {
    // A product has many sales
    Product.hasMany(models.Sale, {
      foreignKey: 'productoId',
      as: 'ventas'
    });
  };

  return Product;
};