/**
 * Backend Constants
 * Synchronized with shared/constants.js
 * Code in English, UI text in Spanish
 */

'use strict';

// User roles (synced with database)
const ROLES = {
  ADMIN: {
    ID: 1,
    NAME: 'Administrador'
  },
  ADVISOR: {
    ID: 2,
    NAME: 'Asesor'
  }
};

// Sale statuses
const SALE_STATUSES = {
  OPEN: 'Abierto',
  IN_PROCESS: 'En Proceso',
  FINISHED: 'Finalizado'
};

// Product type IDs (synced with database seeds)
const PRODUCTS = {
  CONSUMER_CREDIT: {
    ID: 1,
    NAME: 'Credito de Consumo'
  },
  FREE_INVESTMENT_PAYROLL: {
    ID: 2,
    NAME: 'Libranza Libre Inversión'
  },
  CREDIT_CARD: {
    ID: 3,
    NAME: 'Tarjeta de Credito'
  }
};

// Franchise IDs (synced with database seeds)
const FRANCHISES = {
  AMEX: {
    ID: 1,
    NAME: 'AMEX'
  },
  VISA: {
    ID: 2,
    NAME: 'VISA'
  },
  MASTERCARD: {
    ID: 3,
    NAME: 'MASTERCARD'
  }
};

// HTTP Status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

// Custom error codes
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  SERVER_ERROR: 'SERVER_ERROR',
  CAPTCHA_ERROR: 'CAPTCHA_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR'
};

// Validation rules
const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 255,
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 50,
  AMOUNT_MIN: 0.01,
  RATE_MIN: 0,
  RATE_MAX: 100
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// JWT Configuration
const JWT = {
  DEFAULT_EXPIRATION: '24h',
  REFRESH_EXPIRATION: '7d'
};

module.exports = {
  ROLES,
  SALE_STATUSES,
  PRODUCTS,
  FRANCHISES,
  HTTP_STATUS,
  ERROR_CODES,
  VALIDATION,
  PAGINATION,
  JWT
};