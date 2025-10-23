/**
 * User Service
 * Handles user CRUD operations and business logic
 */

'use strict';

const { User, Role } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, DuplicateEntryError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');
const { ROLES } = require('../utils/constants');

/**
 * Find All Users
 * Retrieves users with optional filtering and pagination
 * @param {Object} filters - Filter options (search, rolId)
 * @param {Object} pagination - Pagination options (page, limit)
 * @returns {Object} Users list with pagination metadata
 */
const findAllUsers = async (filters = {}, pagination = {}) => {
  try {
    const { search, rolId } = filters;
    const { page = 1, limit = 10 } = pagination;

    // Build where clause
    const whereClause = {};

    // Search by name or email
    if (search) {
      whereClause[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filter by role
    if (rolId) {
      whereClause.rolId = rolId;
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Query users
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'nombre', 'email', 'rolId', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre', 'descripcion']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    // Format users
    const formattedUsers = users.map(user => ({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rolId: user.rolId,
      rolNombre: user.rol.nombre,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    logger.debug(`Retrieved ${users.length} users (total: ${count})`);

    // Return with pagination metadata
    return {
      users: formattedUsers,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    logger.error('Error in findAllUsers:', error);
    throw error;
  }
};

/**
 * Find User by ID
 * Retrieves a single user by ID
 * @param {Number} id - User ID
 * @returns {Object} User data
 */
const findUserById = async (id) => {
  try {
    const user = await User.findByPk(id, {
      attributes: ['id', 'nombre', 'email', 'rolId', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre', 'descripcion']
        }
      ]
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    logger.debug(`Retrieved user: ${user.email}`);

    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rolId: user.rolId,
      rolNombre: user.rol.nombre,
      rolDescripcion: user.rol.descripcion,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  } catch (error) {
    // Re-throw known errors
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Error in findUserById:', error);
    throw error;
  }
};

/**
 * Create New User
 * Creates a new user with validation
 * @param {Object} userData - User data (nombre, email, password, rolId)
 * @returns {Object} Created user data
 */
const createNewUser = async (userData) => {
  try {
    const { nombre, email, password, rolId } = userData;

    // Validate required fields
    if (!nombre || !email || !password || !rolId) {
      throw new ValidationError('All fields are required: nombre, email, password, rolId');
    }

    // Validate role exists
    const validRoles = [ROLES.ADMIN.ID, ROLES.ADVISOR.ID];
    if (!validRoles.includes(parseInt(rolId))) {
      throw new ValidationError('Invalid role ID');
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      throw new DuplicateEntryError('Email already exists');
    }

    // Create user (password will be hashed by beforeCreate hook)
    const user = await User.create({
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      password,
      rolId: parseInt(rolId)
    });

    // Load user with role
    const createdUser = await User.findByPk(user.id, {
      attributes: ['id', 'nombre', 'email', 'rolId', 'createdAt'],
      include: [
        {
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre']
        }
      ]
    });

    logger.info(`User created: ${createdUser.email} (${createdUser.rol.nombre})`);

    return {
      id: createdUser.id,
      nombre: createdUser.nombre,
      email: createdUser.email,
      rolId: createdUser.rolId,
      rolNombre: createdUser.rol.nombre,
      createdAt: createdUser.createdAt
    };
  } catch (error) {
    // Re-throw known errors
    if (error instanceof ValidationError || error instanceof DuplicateEntryError) {
      throw error;
    }

    logger.error('Error in createNewUser:', error);
    throw error;
  }
};

/**
 * Update User by ID
 * Updates user data with validation
 * @param {Number} id - User ID
 * @param {Object} userData - User data to update (nombre, email, password, rolId)
 * @returns {Object} Updated user data
 */
const updateUserById = async (id, userData) => {
  try {
    // Find user
    const user = await User.findByPk(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Build update object
    const updateData = {};

    if (userData.nombre !== undefined) {
      updateData.nombre = userData.nombre.trim();
    }

    if (userData.email !== undefined) {
      // Check if email is being changed and if new email already exists
      if (userData.email.toLowerCase().trim() !== user.email) {
        const existingUser = await User.findOne({
          where: {
            email: userData.email.toLowerCase().trim(),
            id: { [Op.ne]: id }
          }
        });

        if (existingUser) {
          throw new DuplicateEntryError('Email already exists');
        }

        updateData.email = userData.email.toLowerCase().trim();
      }
    }

    if (userData.password !== undefined) {
      // Password will be hashed by beforeUpdate hook
      updateData.password = userData.password;
    }

    if (userData.rolId !== undefined) {
      // Validate role
      const validRoles = [ROLES.ADMIN.ID, ROLES.ADVISOR.ID];
      if (!validRoles.includes(parseInt(userData.rolId))) {
        throw new ValidationError('Invalid role ID');
      }

      updateData.rolId = parseInt(userData.rolId);
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('No fields to update');
    }

    // Update user
    await user.update(updateData);

    // Load updated user with role
    const updatedUser = await User.findByPk(id, {
      attributes: ['id', 'nombre', 'email', 'rolId', 'updatedAt'],
      include: [
        {
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre']
        }
      ]
    });

    logger.info(`User updated: ${updatedUser.email}`);

    return {
      id: updatedUser.id,
      nombre: updatedUser.nombre,
      email: updatedUser.email,
      rolId: updatedUser.rolId,
      rolNombre: updatedUser.rol.nombre,
      updatedAt: updatedUser.updatedAt
    };
  } catch (error) {
    // Re-throw known errors
    if (error instanceof NotFoundError ||
        error instanceof DuplicateEntryError ||
        error instanceof ValidationError) {
      throw error;
    }

    logger.error('Error in updateUserById:', error);
    throw error;
  }
};

/**
 * Delete User by ID
 * Deletes a user (soft delete if configured, hard delete otherwise)
 * @param {Number} id - User ID
 * @returns {Boolean} Success status
 */
const deleteUserById = async (id) => {
  try {
    // Find user
    const user = await User.findByPk(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Store email for logging
    const userEmail = user.email;

    // Delete user
    await user.destroy();

    logger.info(`User deleted: ${userEmail}`);

    return true;
  } catch (error) {
    // Re-throw known errors
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Error in deleteUserById:', error);
    throw error;
  }
};

/**
 * Check if Email Exists
 * Checks if an email is already in use
 * @param {String} email - Email to check
 * @param {Number} excludeUserId - User ID to exclude from check (for updates)
 * @returns {Boolean} True if email exists
 */
const checkEmailExists = async (email, excludeUserId = null) => {
  try {
    const whereClause = {
      email: email.toLowerCase().trim()
    };

    if (excludeUserId) {
      whereClause.id = { [Op.ne]: excludeUserId };
    }

    const user = await User.findOne({ where: whereClause });

    return !!user;
  } catch (error) {
    logger.error('Error in checkEmailExists:', error);
    throw error;
  }
};

/**
 * Get Users Count by Role
 * Returns count of users grouped by role
 * @returns {Object} User counts by role
 */
const getUsersCountByRole = async () => {
  try {
    const adminCount = await User.count({
      where: { rolId: ROLES.ADMIN.ID }
    });

    const advisorCount = await User.count({
      where: { rolId: ROLES.ADVISOR.ID }
    });

    return {
      admin: adminCount,
      advisor: advisorCount,
      total: adminCount + advisorCount
    };
  } catch (error) {
    logger.error('Error in getUsersCountByRole:', error);
    throw error;
  }
};

module.exports = {
  findAllUsers,
  findUserById,
  createNewUser,
  updateUserById,
  deleteUserById,
  checkEmailExists,
  getUsersCountByRole
};