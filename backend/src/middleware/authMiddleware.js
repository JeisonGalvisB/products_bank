/**
 * Authentication Middleware
 * Verifies JWT token and loads user information
 */

'use strict';

const { verifyToken, extractTokenFromHeader } = require('../config/jwt');
const { User, Role } = require('../models');
const { AuthenticationError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Verify JWT Token Middleware
 * Extracts and verifies JWT token from Authorization header
 * Loads user info and attaches to req.user
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const verifyAuth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    // Verify token
    const decoded = verifyToken(token);

    // Load user from database
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'nombre', 'email', 'rolId'],
      include: [
        {
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre']
        }
      ]
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rolId: user.rolId,
      rolNombre: user.rol.nombre
    };

    // Attach token to request
    req.token = token;

    logger.debug(`User authenticated: ${user.email} (${user.rol.nombre})`);

    next();
  } catch (error) {
    // Pass authentication errors to error handler
    if (error instanceof AuthenticationError) {
      return next(error);
    }

    // Handle unexpected errors
    logger.error('Authentication middleware error:', error);
    return next(new AuthenticationError('Authentication failed'));
  }
};

/**
 * Optional Authentication Middleware
 * Like verifyAuth but doesn't fail if no token is provided
 * Useful for routes that work differently for authenticated/anonymous users
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    // If no token, continue without authentication
    if (!token) {
      req.user = null;
      return next();
    }

    // Try to verify token
    const decoded = verifyToken(token);

    // Load user from database
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'nombre', 'email', 'rolId'],
      include: [
        {
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre']
        }
      ]
    });

    if (user) {
      req.user = {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rolId: user.rolId,
        rolNombre: user.rol.nombre
      };
      req.token = token;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    req.user = null;
    next();
  }
};

/**
 * Check if user is authenticated
 * Alias for verifyAuth for better readability
 */
const isAuthenticated = verifyAuth;

module.exports = {
  verifyAuth,
  optionalAuth,
  isAuthenticated
};