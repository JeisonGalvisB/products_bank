/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

'use strict';

const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse } = require('../utils/responses');
const { HTTP_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Login
 * POST /api/auth/login
 * Authenticates user with email and password
 * @requires captchaMiddleware (verifyCaptcha)
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Authenticate user
  const result = await authService.authenticateUser(email, password);

  logger.info(`User logged in: ${email}`);

  // Return user data and token
  return successResponse(
    res,
    result,
    'Login successful',
    HTTP_STATUS.OK
  );
});

/**
 * Logout
 * POST /api/auth/logout
 * Logs out current user (client-side token removal)
 * This is mainly for logging purposes, actual logout happens on client
 */
const logout = asyncHandler(async (req, res) => {
  // Get user from req (set by authMiddleware)
  const user = req.user;

  if (user) {
    logger.info(`User logged out: ${user.email}`);
  }

  return successResponse(
    res,
    null,
    'Logout successful',
    HTTP_STATUS.OK
  );
});

/**
 * Verify Token
 * GET /api/auth/verify
 * Verifies JWT token and returns user data
 * @requires authMiddleware (verifyAuth)
 */
const verifyToken = asyncHandler(async (req, res) => {
  // User is already verified by authMiddleware
  const user = req.user;

  // Get fresh user data from service
  const userData = await authService.verifyUserToken(user.id);

  return successResponse(
    res,
    userData,
    'Token is valid',
    HTTP_STATUS.OK
  );
});

/**
 * Get Profile
 * GET /api/auth/profile
 * Returns current user's profile
 * @requires authMiddleware (verifyAuth)
 */
const getProfile = asyncHandler(async (req, res) => {
  // User is already verified by authMiddleware
  const user = req.user;

  // Get detailed profile
  const profile = await authService.getUserProfile(user.id);

  return successResponse(
    res,
    profile,
    'Profile retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Change Password
 * PUT /api/auth/change-password
 * Changes current user's password
 * @requires authMiddleware (verifyAuth)
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;

  // Change password
  await authService.changeUserPassword(user.id, currentPassword, newPassword);

  logger.info(`Password changed for user: ${user.email}`);

  return successResponse(
    res,
    null,
    'Password changed successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Refresh Token
 * POST /api/auth/refresh
 * Generates a new token for authenticated user
 * @requires authMiddleware (verifyAuth)
 */
const refreshToken = asyncHandler(async (req, res) => {
  const user = req.user;

  // Re-authenticate to get new token
  const result = await authService.verifyUserToken(user.id);

  // Generate new token (this would require updating authService to return token)
  const { generateToken } = require('../config/jwt');
  const newToken = generateToken({
    id: user.id,
    email: user.email,
    rolId: user.rolId
  });

  logger.info(`Token refreshed for user: ${user.email}`);

  return successResponse(
    res,
    {
      user: result,
      token: newToken
    },
    'Token refreshed successfully',
    HTTP_STATUS.OK
  );
});

module.exports = {
  login,
  logout,
  verifyToken,
  getProfile,
  changePassword,
  refreshToken
};