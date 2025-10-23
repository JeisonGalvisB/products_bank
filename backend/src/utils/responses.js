/**
 * Standard Response Formatters
 * Provides consistent response format across all endpoints
 */

'use strict';

const { HTTP_STATUS } = require('./constants');

/**
 * Success Response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Error Response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {String} errorCode - Custom error code
 * @param {Number} statusCode - HTTP status code (default: 500)
 * @param {Array} details - Additional error details (optional)
 */
const errorResponse = (res, message = 'Error', errorCode = 'SERVER_ERROR', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = null) => {
  const response = {
    success: false,
    error: {
      message,
      code: errorCode
    }
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Paginated Response
 * @param {Object} res - Express response object
 * @param {Array} items - Array of items
 * @param {Object} pagination - Pagination info
 * @param {Number} pagination.page - Current page
 * @param {Number} pagination.limit - Items per page
 * @param {Number} pagination.total - Total items count
 * @param {String} message - Success message
 */
const paginatedResponse = (res, items, pagination, message = 'Success') => {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
};

/**
 * Created Response (201)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {String} message - Success message
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
  return successResponse(res, data, message, HTTP_STATUS.CREATED);
};

/**
 * No Content Response (204)
 * @param {Object} res - Express response object
 */
const noContentResponse = (res) => {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
};

/**
 * Validation Error Response (400)
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 * @param {String} message - Error message
 */
const validationErrorResponse = (res, errors = [], message = 'Validation failed') => {
  return errorResponse(
    res,
    message,
    'VALIDATION_ERROR',
    HTTP_STATUS.BAD_REQUEST,
    errors
  );
};

/**
 * Not Found Response (404)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(
    res,
    message,
    'NOT_FOUND',
    HTTP_STATUS.NOT_FOUND
  );
};

/**
 * Unauthorized Response (401)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(
    res,
    message,
    'AUTHENTICATION_ERROR',
    HTTP_STATUS.UNAUTHORIZED
  );
};

/**
 * Forbidden Response (403)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const forbiddenResponse = (res, message = 'Forbidden access') => {
  return errorResponse(
    res,
    message,
    'AUTHORIZATION_ERROR',
    HTTP_STATUS.FORBIDDEN
  );
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse
};