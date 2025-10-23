/**
 * Google reCAPTCHA Verification Middleware
 * Validates reCAPTCHA v2 token from frontend
 */

'use strict';

const axios = require('axios');
const { CaptchaError } = require('../utils/errors');
const logger = require('../utils/logger');
require('dotenv').config();

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/**
 * Verify reCAPTCHA Token
 * Validates the captcha token sent from frontend
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const verifyCaptcha = async (req, res, next) => {
  try {
    // Extract captcha token from request body
    const captchaToken = req.body.captchaToken || req.body.captcha;

    // Check if captcha token is provided
    if (!captchaToken) {
      logger.warn('Captcha verification failed: no token provided');
      throw new CaptchaError('Captcha token is required');
    }

    // Check if secret key is configured
    if (!RECAPTCHA_SECRET_KEY) {
      logger.error('reCAPTCHA secret key not configured');
      throw new CaptchaError('Captcha verification not configured');
    }

    // Skip captcha verification in test environment
    if (process.env.NODE_ENV === 'test') {
      logger.debug('Skipping captcha verification in test environment');
      return next();
    }

    // Verify captcha with Google
    const response = await axios.post(
      RECAPTCHA_VERIFY_URL,
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET_KEY,
          response: captchaToken,
          remoteip: req.ip
        },
        timeout: 5000
      }
    );

    const { success, score, action, 'error-codes': errorCodes } = response.data;

    // Check if verification was successful
    if (!success) {
      logger.warn('Captcha verification failed:', {
        errorCodes,
        ip: req.ip
      });

      // Handle specific error codes
      if (errorCodes && errorCodes.includes('timeout-or-duplicate')) {
        throw new CaptchaError('Captcha token has expired or already been used');
      }

      throw new CaptchaError('Captcha verification failed');
    }

    // For reCAPTCHA v3, check score (if available)
    if (score !== undefined) {
      const minimumScore = 0.5; // Adjust threshold as needed
      if (score < minimumScore) {
        logger.warn(`Captcha score too low: ${score}`, {
          ip: req.ip,
          action
        });
        throw new CaptchaError('Captcha verification failed: suspicious activity detected');
      }
    }

    // Log successful verification
    logger.debug('Captcha verified successfully', {
      ip: req.ip,
      score: score || 'N/A',
      action: action || 'N/A'
    });

    // Attach captcha verification result to request
    req.captchaVerified = true;

    next();
  } catch (error) {
    // Handle axios/network errors
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      logger.error('Captcha verification timeout');
      return next(new CaptchaError('Captcha verification timeout'));
    }

    if (axios.isAxiosError(error)) {
      logger.error('Captcha verification network error:', error.message);
      return next(new CaptchaError('Captcha verification service unavailable'));
    }

    // Pass captcha errors to error handler
    if (error instanceof CaptchaError) {
      return next(error);
    }

    // Handle unexpected errors
    logger.error('Unexpected error in captcha middleware:', error);
    return next(new CaptchaError('Captcha verification failed'));
  }
};

/**
 * Optional Captcha Verification
 * Like verifyCaptcha but doesn't fail if no token is provided
 * Useful for endpoints where captcha is recommended but not required
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const optionalCaptcha = async (req, res, next) => {
  try {
    const captchaToken = req.body.captchaToken || req.body.captcha;

    // If no token, continue without verification
    if (!captchaToken) {
      req.captchaVerified = false;
      return next();
    }

    // If token provided, verify it
    return verifyCaptcha(req, res, next);
  } catch (error) {
    // On error, continue without verification
    req.captchaVerified = false;
    next();
  }
};

/**
 * Skip Captcha in Development
 * Wrapper that skips captcha verification in development environment
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const verifyCaptchaIfProduction = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Skipping captcha verification in development mode');
    req.captchaVerified = true;
    return next();
  }

  return verifyCaptcha(req, res, next);
};

module.exports = {
  verifyCaptcha,
  optionalCaptcha,
  verifyCaptchaIfProduction
};