/**
 * Main Router
 * Groups and exports all application routes
 */

'use strict';

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const saleRoutes = require('./saleRoutes');
const productRoutes = require('./productRoutes');
const statsRoutes = require('./statsRoutes');

// Health check route
const { successResponse } = require('../utils/responses');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * GET /api/health
 * Health check endpoint
 * Public - no authentication required
 */
router.get('/health', (req, res) => {
  return successResponse(
    res,
    {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    },
    'Service is healthy',
    HTTP_STATUS.OK
  );
});

/**
 * GET /api
 * API information endpoint
 * Public - no authentication required
 */
router.get('/', (req, res) => {
  return successResponse(
    res,
    {
      name: 'Products Bank API',
      version: '1.0.0',
      description: 'Financial products sales management system',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        sales: '/api/sales',
        products: '/api/products',
        franchises: '/api/franchises',
        roles: '/api/roles',
        stats: '/api/stats',
        health: '/api/health'
      }
    },
    'Welcome to Products Bank API',
    HTTP_STATUS.OK
  );
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/sales', saleRoutes);
router.use('/', productRoutes); // Products, franchises, and roles use root path with prefix
router.use('/stats', statsRoutes);

module.exports = router;