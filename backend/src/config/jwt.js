/**
 * JWT Configuration and Utilities
 * Handles token generation and verification
 */

'use strict';

const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../utils/errors');
require('dotenv').config();

// JWT Secret and expiration from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

/**
 * Generate JWT Token
 * @param {Object} payload - Data to encode in token
 * @param {String} expiresIn - Token expiration time (optional)
 * @returns {String} JWT token
 */
const generateToken = (payload, expiresIn = JWT_EXPIRATION) => {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

/**
 * Verify JWT Token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {AuthenticationError} If token is invalid or expired
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Invalid token');
    }
    throw new AuthenticationError('Token verification failed');
  }
};

/**
 * Decode JWT Token without verification
 * Useful for debugging or getting token info
 * @param {String} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Generate token for user authentication
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateAuthToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    rolId: user.rolId
  };
  return generateToken(payload);
};

/**
 * Extract token from Authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} Token or null if not found
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  // Check if header starts with "Bearer "
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove "Bearer " prefix
  }

  return authHeader;
};

module.exports = {
  JWT_SECRET,
  JWT_EXPIRATION,
  generateToken,
  verifyToken,
  decodeToken,
  generateAuthToken,
  extractTokenFromHeader
};