/**
 * Authentication Routes
 * Defines routes for authentication endpoints
 */

'use strict';

const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controllers/authController');

// Middleware
const { verifyAuth } = require('../middleware/authMiddleware');
const { verifyCaptcha } = require('../middleware/captchaMiddleware');
const { validateLogin } = require('../middleware/validationMiddleware');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validationMiddleware');
const { VALIDATION } = require('../utils/constants');

/**
 * POST /api/auth/login
 * Login with email and password
 * Requires: captcha verification, input validation
 */
router.post(
  '/login',
  verifyCaptcha,
  validateLogin,
  authController.login
);

/**
 * POST /api/auth/logout
 * Logout current user
 * Requires: authentication
 */
router.post(
  '/logout',
  verifyAuth,
  authController.logout
);

/**
 * GET /api/auth/verify
 * Verify JWT token
 * Requires: authentication
 */
router.get(
  '/verify',
  verifyAuth,
  authController.verifyToken
);

/**
 * GET /api/auth/profile
 * Get current user profile
 * Requires: authentication
 */
router.get(
  '/profile',
  verifyAuth,
  authController.getProfile
);

/**
 * PUT /api/auth/change-password
 * Change current user password
 * Requires: authentication, validation
 */
router.put(
  '/change-password',
  verifyAuth,
  [
    body('currentPassword')
      .notEmpty().withMessage('Current password is required'),

    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: VALIDATION.PASSWORD_MIN_LENGTH, max: VALIDATION.PASSWORD_MAX_LENGTH })
      .withMessage(`Password must be between ${VALIDATION.PASSWORD_MIN_LENGTH} and ${VALIDATION.PASSWORD_MAX_LENGTH} characters`)
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    handleValidationErrors
  ],
  authController.changePassword
);

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 * Requires: authentication
 */
router.post(
  '/refresh',
  verifyAuth,
  authController.refreshToken
);

module.exports = router;