/**
 * User Controller
 * Handles HTTP requests for user management endpoints
 */

'use strict';

const userService = require('../services/userService');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse, createdResponse } = require('../utils/responses');
const { HTTP_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Get All Users
 * GET /api/users
 * Returns list of users with optional filtering and pagination
 * @requires authMiddleware (verifyAuth)
 * @requires roleMiddleware (isAdmin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { search, rolId, page, limit } = req.query;

  // Build filters
  const filters = {};
  if (search) filters.search = search;
  if (rolId) filters.rolId = parseInt(rolId);

  // Build pagination
  const pagination = {};
  if (page) pagination.page = parseInt(page);
  if (limit) pagination.limit = parseInt(limit);

  // Get users
  const result = await userService.findAllUsers(filters, pagination);

  return successResponse(
    res,
    result,
    'Users retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Get User by ID
 * GET /api/users/:id
 * Returns a single user by ID
 * @requires authMiddleware (verifyAuth)
 * @requires roleMiddleware (isAdmin or isOwnerOrAdmin)
 */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get user
  const user = await userService.findUserById(parseInt(id));

  return successResponse(
    res,
    user,
    'User retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Create User
 * POST /api/users
 * Creates a new user
 * @requires authMiddleware (verifyAuth)
 * @requires roleMiddleware (isAdmin)
 */
const createUser = asyncHandler(async (req, res) => {
  const { nombre, email, password, rolId } = req.body;
  const currentUser = req.user;

  // Create user
  const user = await userService.createNewUser({
    nombre,
    email,
    password,
    rolId
  });

  logger.info(`User created: ${user.email} by admin ${currentUser.email}`);

  return createdResponse(
    res,
    user,
    'User created successfully'
  );
});

/**
 * Update User
 * PUT /api/users/:id
 * Updates an existing user
 * @requires authMiddleware (verifyAuth)
 * @requires roleMiddleware (isAdmin or isOwnerOrAdmin)
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password, rolId } = req.body;
  const currentUser = req.user;

  // Build update data
  const updateData = {};
  if (nombre !== undefined) updateData.nombre = nombre;
  if (email !== undefined) updateData.email = email;
  if (password !== undefined) updateData.password = password;
  if (rolId !== undefined) updateData.rolId = rolId;

  // Update user
  const user = await userService.updateUserById(parseInt(id), updateData);

  logger.info(`User updated: ${user.email} by ${currentUser.email}`);

  return successResponse(
    res,
    user,
    'User updated successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Delete User
 * DELETE /api/users/:id
 * Deletes a user
 * @requires authMiddleware (verifyAuth)
 * @requires roleMiddleware (isAdmin)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  // Prevent admin from deleting themselves
  if (parseInt(id) === currentUser.id) {
    const { ValidationError } = require('../utils/errors');
    throw new ValidationError('You cannot delete your own account');
  }

  // Delete user
  await userService.deleteUserById(parseInt(id));

  logger.info(`User deleted: ID ${id} by admin ${currentUser.email}`);

  return successResponse(
    res,
    null,
    'User deleted successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Check Email Availability
 * GET /api/users/check-email
 * Checks if an email is available
 * @requires authMiddleware (verifyAuth)
 */
const checkEmail = asyncHandler(async (req, res) => {
  const { email, excludeUserId } = req.query;

  // Check email
  const exists = await userService.checkEmailExists(
    email,
    excludeUserId ? parseInt(excludeUserId) : null
  );

  return successResponse(
    res,
    { available: !exists },
    exists ? 'Email is already in use' : 'Email is available',
    HTTP_STATUS.OK
  );
});

/**
 * Get Users Count by Role
 * GET /api/users/count-by-role
 * Returns count of users grouped by role
 * @requires authMiddleware (verifyAuth)
 * @requires roleMiddleware (isAdmin)
 */
const getUsersCountByRole = asyncHandler(async (req, res) => {
  // Get counts
  const counts = await userService.getUsersCountByRole();

  return successResponse(
    res,
    counts,
    'User counts retrieved successfully',
    HTTP_STATUS.OK
  );
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  checkEmail,
  getUsersCountByRole
};