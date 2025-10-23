/**
 * Role Model
 * Represents user roles (Administrador, Asesor)
 */

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
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
        len: [3, 50]
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'roles',
    timestamps: true
  });

  // Define associations
  Role.associate = function(models) {
    // A role has many users
    Role.hasMany(models.User, {
      foreignKey: 'rolId',
      as: 'usuarios'
    });
  };

  return Role;
};