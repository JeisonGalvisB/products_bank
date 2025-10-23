/**
 * Custom Error Classes
 * Extends Error class for specific error types
 */

'use strict';

const { HTTP_STATUS, ERROR_CODES } = require('./constants');

/**
 * Base Application Error
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error - 400
 * Used for input validation failures
 */
class ValidationError extends AppError {
  constructor(message = 'Validation error', details = []) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    this.details = details;
  }
}

/**
 * Authentication Error - 401
 * Used when authentication fails (invalid credentials, missing token)
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTHENTICATION_ERROR);
  }
}

/**
 * Authorization Error - 403
 * Used when user doesn't have permission to access resource
 */
class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.AUTHORIZATION_ERROR);
  }
}

/**
 * Not Found Error - 404
 * Used when requested resource doesn't exist
 */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }
}

/**
 * Duplicate Entry Error - 409
 * Used when trying to create a resource that already exists
 */
class DuplicateEntryError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, HTTP_STATUS.CONFLICT, ERROR_CODES.DUPLICATE_ENTRY);
  }
}

/**
 * Database Error - 500
 * Used for database-related errors
 */
class DatabaseError extends AppError {
  constructor(message = 'Database error occurred') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODES.DATABASE_ERROR);
  }
}

/**
 * Captcha Error - 400
 * Used when captcha validation fails
 */
class CaptchaError extends AppError {
  constructor(message = 'Captcha validation failed') {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.CAPTCHA_ERROR);
  }
}

/**
 * Generic Server Error - 500
 * Used for unexpected server errors
 */
class ServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODES.SERVER_ERROR);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DuplicateEntryError,
  DatabaseError,
  CaptchaError,
  ServerError
};