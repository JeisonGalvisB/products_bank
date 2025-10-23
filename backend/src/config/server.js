/**
 * Express Server Configuration
 * Handles middleware setup: CORS, Helmet, Rate Limiting, Body Parser
 */

'use strict';

const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');
require('dotenv').config();

/**
 * CORS Configuration
 * Allows requests from specified origins
 */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['http://localhost:3000'];

    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

/**
 * Rate Limiting Configuration
 * Prevents brute force attacks and abuse
 */
const limiterOptions = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    });
  }
};

/**
 * Strict Rate Limiter for sensitive endpoints (login, etc.)
 */
const strictLimiterOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many attempts, please try again later',
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    logger.warn(`Strict rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many login attempts, please try again later',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    });
  }
};

/**
 * Helmet Configuration
 * Sets security-related HTTP headers
 */
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  },
  crossOriginEmbedderPolicy: false
};

/**
 * Morgan Configuration
 * HTTP request logger
 */
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

/**
 * Body Parser Limits
 */
const bodyParserOptions = {
  limit: '10mb',
  extended: true
};

/**
 * Apply all middleware to Express app
 * @param {Object} app - Express application
 */
const configureServer = (app) => {
  // Security middleware
  app.use(helmet(helmetOptions));

  // CORS
  app.use(cors(corsOptions));

  // HTTP request logger
  app.use(morgan(morganFormat, { stream: logger.stream }));

  // Body parsers
  app.use(require('express').json(bodyParserOptions));
  app.use(require('express').urlencoded({ extended: true, limit: '10mb' }));

  // Trust proxy (for rate limiting and IP detection)
  app.set('trust proxy', 1);

  // Global rate limiter
  app.use(rateLimit(limiterOptions));

  logger.info('Server middleware configured successfully');
};

/**
 * Create rate limiters
 */
const createRateLimiter = () => rateLimit(limiterOptions);
const createStrictRateLimiter = () => rateLimit(strictLimiterOptions);

module.exports = {
  corsOptions,
  helmetOptions,
  configureServer,
  createRateLimiter,
  createStrictRateLimiter
};