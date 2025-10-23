/**
 * Franchise Model
 * Represents credit card franchises
 * (AMEX, VISA, MASTERCARD)
 */

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Franchise = sequelize.define('Franchise', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 50]
      }
    }
  }, {
    tableName: 'franquicias',
    timestamps: true
  });

  // Define associations
  Franchise.associate = function(models) {
    // A franchise has many sales
    Franchise.hasMany(models.Sale, {
      foreignKey: 'franquiciaId',
      as: 'ventas'
    });
  };

  return Franchise;
};