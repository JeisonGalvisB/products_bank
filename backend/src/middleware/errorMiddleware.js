/**
 * Global Error Handler Middleware
 * Catches all errors and sends standardized error responses
 */

'use strict';

const logger = require('../utils/logger');
const { errorResponse } = require('../utils/responses');
const { AppError } = require('../utils/errors');
const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');

/**
 * Error Handler Middleware
 * Must be the last middleware in the chain
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log error details
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user ? req.user.id : 'anonymous'
  });

  // Handle operational errors (our custom errors)
  if (err instanceof AppError && err.isOperational) {
    return errorResponse(
      res,
      err.message,
      err.errorCode,
      err.statusCode,
      err.details || null
    );
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const details = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));

    return errorResponse(
      res,
      'Validation error',
      ERROR_CODES.VALIDATION_ERROR,
      HTTP_STATUS.BAD_REQUEST,
      details
    );
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    const message = `${field} already exists`;

    return errorResponse(
      res,
      message,
      ERROR_CODES.DUPLICATE_ENTRY,
      HTTP_STATUS.CONFLICT
    );
  }

  // Handle Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return errorResponse(
      res,
      'Related resource not found or constraint violation',
      ERROR_CODES.VALIDATION_ERROR,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Handle Sequelize database errors
  if (err.name && err.name.startsWith('Sequelize')) {
    logger.error('Database error:', err);
    return errorResponse(
      res,
      'Database error occurred',
      ERROR_CODES.DATABASE_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(
      res,
      'Invalid token',
      ERROR_CODES.AUTHENTICATION_ERROR,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(
      res,
      'Token has expired',
      ERROR_CODES.AUTHENTICATION_ERROR,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // Handle multer file upload errors
  if (err.name === 'MulterError') {
    return errorResponse(
      res,
      `File upload error: ${err.message}`,
      ERROR_CODES.VALIDATION_ERROR,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Handle syntax errors in JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(
      res,
      'Invalid JSON format',
      ERROR_CODES.VALIDATION_ERROR,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Handle unexpected errors (programming errors, bugs)
  logger.error('Unexpected error:', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });

  // Don't expose internal error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;

  return errorResponse(
    res,
    message,
    ERROR_CODES.SERVER_ERROR,
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
};

/**
 * 404 Not Found Handler
 * Handles requests to non-existent routes
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  return errorResponse(
    res,
    `Route ${req.method} ${req.path} not found`,
    ERROR_CODES.NOT_FOUND,
    HTTP_STATUS.NOT_FOUND
  );
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};