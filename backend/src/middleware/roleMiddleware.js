/**
 * Role-Based Authorization Middleware
 * Checks if authenticated user has required role/permissions
 */

'use strict';

const { AuthorizationError, AuthenticationError } = require('../utils/errors');
const { ROLES } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Check if user is Admin
 * Must be used after verifyAuth middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const isAdmin = (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Check if user has admin role
    if (req.user.rolId !== ROLES.ADMIN.ID) {
      logger.warn(`Authorization denied for user ${req.user.email}: not an admin`);
      throw new AuthorizationError('Admin access required');
    }

    logger.debug(`Admin access granted for user: ${req.user.email}`);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user is Advisor
 * Must be used after verifyAuth middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const isAdvisor = (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Check if user has advisor role
    if (req.user.rolId !== ROLES.ADVISOR.ID) {
      logger.warn(`Authorization denied for user ${req.user.email}: not an advisor`);
      throw new AuthorizationError('Advisor access required');
    }

    logger.debug(`Advisor access granted for user: ${req.user.email}`);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user is Admin OR Advisor (any authenticated user)
 * Must be used after verifyAuth middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const isAdminOrAdvisor = (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Check if user has any valid role
    const validRoles = [ROLES.ADMIN.ID, ROLES.ADVISOR.ID];
    if (!validRoles.includes(req.user.rolId)) {
      logger.warn(`Authorization denied for user ${req.user.email}: invalid role`);
      throw new AuthorizationError('Access denied');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has any of the specified roles
 * Must be used after verifyAuth middleware
 * @param {Array} allowedRoles - Array of allowed role IDs
 * @returns {Function} Middleware function
 */
const hasRole = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(req.user.rolId)) {
        logger.warn(`Authorization denied for user ${req.user.email}: role ${req.user.rolId} not in allowed roles`);
        throw new AuthorizationError('Insufficient permissions');
      }

      logger.debug(`Role check passed for user: ${req.user.email}`);
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user is resource owner OR admin
 * Useful for routes where users can only access their own resources
 * Must be used after verifyAuth middleware
 * @param {String} paramName - Name of request parameter containing resource owner ID (default: 'userId')
 * @returns {Function} Middleware function
 */
const isOwnerOrAdmin = (paramName = 'userId') => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // Get resource owner ID from request params or body
      const resourceOwnerId = parseInt(req.params[paramName] || req.body[paramName]);

      // Allow if user is admin
      if (req.user.rolId === ROLES.ADMIN.ID) {
        logger.debug(`Admin access granted for user: ${req.user.email}`);
        return next();
      }

      // Allow if user is the resource owner
      if (req.user.id === resourceOwnerId) {
        logger.debug(`Owner access granted for user: ${req.user.email}`);
        return next();
      }

      // Deny access
      logger.warn(`Authorization denied for user ${req.user.email}: not owner and not admin`);
      throw new AuthorizationError('You can only access your own resources');
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Attach resource ownership check to request
 * Adds a helper function to check if current user is resource owner
 * Must be used after verifyAuth middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const attachOwnershipCheck = (req, res, next) => {
  // Add helper function to request
  req.isOwner = (resourceOwnerId) => {
    return req.user && (
      req.user.id === resourceOwnerId ||
      req.user.rolId === ROLES.ADMIN.ID
    );
  };

  next();
};

module.exports = {
  isAdmin,
  isAdvisor,
  isAdminOrAdvisor,
  hasRole,
  isOwnerOrAdmin,
  attachOwnershipCheck
};