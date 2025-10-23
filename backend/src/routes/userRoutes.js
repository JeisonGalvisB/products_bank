/**
 * User Routes
 * Defines routes for user management endpoints
 */

'use strict';

const express = require('express');
const router = express.Router();

// Controllers
const userController = require('../controllers/userController');

// Middleware
const { verifyAuth } = require('../middleware/authMiddleware');
const { isAdmin, isOwnerOrAdmin } = require('../middleware/roleMiddleware');
const {
  validateUserCreate,
  validateUserUpdate,
  validateId,
  validatePagination
} = require('../middleware/validationMiddleware');

/**
 * GET /api/users/check-email
 * Check email availability
 * Requires: authentication
 * Note: Must be before /:id route to avoid conflict
 */
router.get(
  '/check-email',
  verifyAuth,
  userController.checkEmail
);

/**
 * GET /api/users/count-by-role
 * Get users count grouped by role
 * Requires: authentication, admin role
 * Note: Must be before /:id route to avoid conflict
 */
router.get(
  '/count-by-role',
  verifyAuth,
  isAdmin,
  userController.getUsersCountByRole
);

/**
 * GET /api/users
 * Get all users with optional filtering and pagination
 * Requires: authentication, admin role
 */
router.get(
  '/',
  verifyAuth,
  isAdmin,
  validatePagination,
  userController.getAllUsers
);

/**
 * GET /api/users/:id
 * Get user by ID
 * Requires: authentication, admin or owner
 */
router.get(
  '/:id',
  verifyAuth,
  validateId,
  isOwnerOrAdmin('id'),
  userController.getUserById
);

/**
 * POST /api/users
 * Create new user
 * Requires: authentication, admin role, validation
 */
router.post(
  '/',
  verifyAuth,
  isAdmin,
  validateUserCreate,
  userController.createUser
);

/**
 * PUT /api/users/:id
 * Update user
 * Requires: authentication, admin or owner, validation
 */
router.put(
  '/:id',
  verifyAuth,
  validateId,
  isOwnerOrAdmin('id'),
  validateUserUpdate,
  userController.updateUser
);

/**
 * DELETE /api/users/:id
 * Delete user
 * Requires: authentication, admin role
 */
router.delete(
  '/:id',
  verifyAuth,
  validateId,
  isAdmin,
  userController.deleteUser
);

module.exports = router;