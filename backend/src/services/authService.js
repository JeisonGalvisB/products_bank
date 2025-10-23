/**
 * Authentication Service
 * Handles user authentication and authorization logic
 */

'use strict';

const { User, Role } = require('../models');
const { generateToken } = require('../config/jwt');
const { AuthenticationError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Authenticate User
 * Validates email and password, returns user data and JWT token
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Object} User data and token
 */
const authenticateUser = async (email, password) => {
  try {
    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user by email with role
    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() },
      include: [
        {
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre', 'descripcion']
        }
      ]
    });

    // Check if user exists
    if (!user) {
      logger.warn(`Login attempt failed: user not found - ${email}`);
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn(`Login attempt failed: invalid password - ${email}`);
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      rolId: user.rolId
    };

    const token = generateToken(tokenPayload);

    // Log successful authentication
    logger.info(`User authenticated successfully: ${email} (${user.rol.nombre})`);

    // Return user data (without password) and token
    return {
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rolId: user.rolId,
        rolNombre: user.rol.nombre,
        rolDescripcion: user.rol.descripcion
      },
      token
    };
  } catch (error) {
    // Re-throw known errors
    if (error instanceof AuthenticationError || error instanceof ValidationError) {
      throw error;
    }

    // Log and throw unexpected errors
    logger.error('Error in authenticateUser:', error);
    throw new AuthenticationError('Authentication failed');
  }
};

/**
 * Verify User Token
 * Validates JWT token and returns user data
 * @param {Number} userId - User ID from decoded token
 * @returns {Object} User data
 */
const verifyUserToken = async (userId) => {
  try {
    // Find user by ID with role
    const user = await User.findByPk(userId, {
      attributes: ['id', 'nombre', 'email', 'rolId'],
      include: [
        {
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre', 'descripcion']
        }
      ]
    });

    // Check if user exists
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Return user data
    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rolId: user.rolId,
      rolNombre: user.rol.nombre,
      rolDescripcion: user.rol.descripcion
    };
  } catch (error) {
    // Re-throw known errors
    if (error instanceof AuthenticationError) {
      throw error;
    }

    // Log and throw unexpected errors
    logger.error('Error in verifyUserToken:', error);
    throw new AuthenticationError('Token verification failed');
  }
};

/**
 * Get User Profile
 * Returns detailed user profile by ID
 * @param {Number} userId - User ID
 * @returns {Object} User profile data
 */
const getUserProfile = async (userId) => {
  try {
    // Find user by ID with role
    const user = await User.findByPk(userId, {
      attributes: ['id', 'nombre', 'email', 'rolId', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre', 'descripcion']
        }
      ]
    });

    // Check if user exists
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Return user profile
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
    if (error instanceof AuthenticationError) {
      throw error;
    }

    // Log and throw unexpected errors
    logger.error('Error in getUserProfile:', error);
    throw new AuthenticationError('Failed to retrieve user profile');
  }
};

/**
 * Change User Password
 * Updates user password after validating current password
 * @param {Number} userId - User ID
 * @param {String} currentPassword - Current password
 * @param {String} newPassword - New password
 * @returns {Boolean} Success status
 */
const changeUserPassword = async (userId, currentPassword, newPassword) => {
  try {
    // Validate input
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current password and new password are required');
    }

    // Find user
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      logger.warn(`Password change failed: invalid current password - User ID: ${userId}`);
      throw new AuthenticationError('Current password is incorrect');
    }

    // Update password (will be hashed by beforeUpdate hook)
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed successfully for user ID: ${userId}`);

    return true;
  } catch (error) {
    // Re-throw known errors
    if (error instanceof AuthenticationError || error instanceof ValidationError) {
      throw error;
    }

    // Log and throw unexpected errors
    logger.error('Error in changeUserPassword:', error);
    throw new Error('Failed to change password');
  }
};

module.exports = {
  authenticateUser,
  verifyUserToken,
  getUserProfile,
  changeUserPassword
};