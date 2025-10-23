/**
 * Shared constants between Backend and Frontend
 * Keep synchronized with database
 */

// User roles
export const ROLES = {
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
export const SALE_STATUSES = {
  OPEN: 'Abierto',
  IN_PROCESS: 'En Proceso',
  FINISHED: 'Finalizado'
};

// Product type IDs (sync with seeds)
export const PRODUCTS = {
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

// Franchise IDs (sync with seeds)
export const FRANCHISES = {
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

// Custom error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  SERVER_ERROR: 'SERVER_ERROR',
  CAPTCHA_ERROR: 'CAPTCHA_ERROR'
};

// Frontend routes
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  SALES: '/sales',
  STATS: '/stats'
};

// Validation configurations
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 50,
  AMOUNT_MIN: 0.01,
  RATE_MIN: 0,
  RATE_MAX: 100
};