/**
 * Validation Middleware
 * Input validation using express-validator
 */

'use strict';

const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');
const { VALIDATION, PRODUCTS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Handle Validation Errors
 * Checks for validation errors and throws ValidationError if any
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    logger.warn('Validation failed:', formattedErrors);

    throw new ValidationError('Validation failed', formattedErrors);
  }

  next();
};

/**
 * Login Validation Rules
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .isLength({ max: VALIDATION.EMAIL_MAX_LENGTH })
    .withMessage(`Email must not exceed ${VALIDATION.EMAIL_MAX_LENGTH} characters`),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: VALIDATION.PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`),

  handleValidationErrors
];

/**
 * User Creation Validation Rules
 */
const validateUserCreate = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: VALIDATION.NAME_MIN_LENGTH, max: VALIDATION.NAME_MAX_LENGTH })
    .withMessage(`Name must be between ${VALIDATION.NAME_MIN_LENGTH} and ${VALIDATION.NAME_MAX_LENGTH} characters`),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .isLength({ max: VALIDATION.EMAIL_MAX_LENGTH })
    .withMessage(`Email must not exceed ${VALIDATION.EMAIL_MAX_LENGTH} characters`)
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: VALIDATION.PASSWORD_MIN_LENGTH, max: VALIDATION.PASSWORD_MAX_LENGTH })
    .withMessage(`Password must be between ${VALIDATION.PASSWORD_MIN_LENGTH} and ${VALIDATION.PASSWORD_MAX_LENGTH} characters`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('rolId')
    .notEmpty().withMessage('Role is required')
    .isInt({ min: 1 }).withMessage('Invalid role ID')
    .toInt(),

  handleValidationErrors
];

/**
 * User Update Validation Rules
 */
const validateUserUpdate = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: VALIDATION.NAME_MIN_LENGTH, max: VALIDATION.NAME_MAX_LENGTH })
    .withMessage(`Name must be between ${VALIDATION.NAME_MIN_LENGTH} and ${VALIDATION.NAME_MAX_LENGTH} characters`),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email format')
    .isLength({ max: VALIDATION.EMAIL_MAX_LENGTH })
    .withMessage(`Email must not exceed ${VALIDATION.EMAIL_MAX_LENGTH} characters`)
    .normalizeEmail(),

  body('password')
    .optional()
    .isLength({ min: VALIDATION.PASSWORD_MIN_LENGTH, max: VALIDATION.PASSWORD_MAX_LENGTH })
    .withMessage(`Password must be between ${VALIDATION.PASSWORD_MIN_LENGTH} and ${VALIDATION.PASSWORD_MAX_LENGTH} characters`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('rolId')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid role ID')
    .toInt(),

  handleValidationErrors
];

/**
 * Sale Creation Validation Rules
 */
const validateSaleCreate = [
  body('productoId')
    .notEmpty().withMessage('Product is required')
    .isInt({ min: 1 }).withMessage('Invalid product ID')
    .toInt(),

  body('cupoSolicitado')
    .notEmpty().withMessage('Requested amount is required')
    .isFloat({ min: VALIDATION.AMOUNT_MIN })
    .withMessage(`Amount must be at least ${VALIDATION.AMOUNT_MIN}`)
    .toFloat(),

  // Conditional validation: franquiciaId required only for credit cards (product ID 3)
  body('franquiciaId')
    .if(body('productoId').equals(PRODUCTS.CREDIT_CARD.ID.toString()))
    .notEmpty().withMessage('Franchise is required for credit cards')
    .isInt({ min: 1 }).withMessage('Invalid franchise ID')
    .toInt(),

  // Conditional validation: tasa required for credits and payrolls (product IDs 1, 2)
  body('tasa')
    .if((value, { req }) => {
      const productId = parseInt(req.body.productoId);
      return productId === PRODUCTS.CONSUMER_CREDIT.ID || productId === PRODUCTS.FREE_INVESTMENT_PAYROLL.ID;
    })
    .notEmpty().withMessage('Rate is required for credits and payrolls')
    .isFloat({ min: VALIDATION.RATE_MIN, max: VALIDATION.RATE_MAX })
    .withMessage(`Rate must be between ${VALIDATION.RATE_MIN} and ${VALIDATION.RATE_MAX}`)
    .toFloat(),

  body('estado')
    .optional()
    .isIn(['Abierto', 'En Proceso', 'Finalizado'])
    .withMessage('Invalid status'),

  handleValidationErrors
];

/**
 * Sale Update Validation Rules
 */
const validateSaleUpdate = [
  body('productoId')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid product ID')
    .toInt(),

  body('cupoSolicitado')
    .optional()
    .isFloat({ min: VALIDATION.AMOUNT_MIN })
    .withMessage(`Amount must be at least ${VALIDATION.AMOUNT_MIN}`)
    .toFloat(),

  body('franquiciaId')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid franchise ID')
    .toInt(),

  body('tasa')
    .optional()
    .isFloat({ min: VALIDATION.RATE_MIN, max: VALIDATION.RATE_MAX })
    .withMessage(`Rate must be between ${VALIDATION.RATE_MIN} and ${VALIDATION.RATE_MAX}`)
    .toFloat(),

  body('estado')
    .optional()
    .isIn(['Abierto', 'En Proceso', 'Finalizado'])
    .withMessage('Invalid status'),

  handleValidationErrors
];

/**
 * ID Parameter Validation
 */
const validateId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid ID')
    .toInt(),

  handleValidationErrors
];

/**
 * Pagination Query Validation
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),

  handleValidationErrors
];

/**
 * Date Range Query Validation
 */
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format')
    .toDate(),

  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format')
    .toDate()
    .custom((endDate, { req }) => {
      if (req.query.startDate && endDate < new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateLogin,
  validateUserCreate,
  validateUserUpdate,
  validateSaleCreate,
  validateSaleUpdate,
  validateId,
  validatePagination,
  validateDateRange
};