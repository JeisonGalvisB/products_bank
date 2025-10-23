/**
 * Statistics Routes
 * Defines routes for statistics and dashboard endpoints with role-based access control
 */

'use strict';

const express = require('express');
const router = express.Router();

// Controllers
const statsController = require('../controllers/statsController');

// Middleware
const { verifyAuth } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const { validateDateRange } = require('../middleware/validationMiddleware');

/**
 * GET /api/stats/dashboard
 * Get dashboard metrics
 * Requires: authentication
 */
router.get(
  '/dashboard',
  verifyAuth,
  validateDateRange,
  statsController.getDashboardMetrics
);

/**
 * GET /api/stats/comprehensive
 * Get comprehensive dashboard (all data in one request)
 * Requires: authentication
 */
router.get(
  '/comprehensive',
  verifyAuth,
  validateDateRange,
  statsController.getComprehensiveDashboard
);

/**
 * GET /api/stats/by-product
 * Get sales grouped by product
 * Requires: authentication
 */
router.get(
  '/by-product',
  verifyAuth,
  validateDateRange,
  statsController.getSalesByProduct
);

/**
 * GET /api/stats/by-advisor
 * Get sales grouped by advisor (Admin only)
 * Requires: authentication, admin role
 */
router.get(
  '/by-advisor',
  verifyAuth,
  isAdmin,
  validateDateRange,
  statsController.getSalesByAdvisor
);

/**
 * GET /api/stats/by-status
 * Get sales grouped by status
 * Requires: authentication
 */
router.get(
  '/by-status',
  verifyAuth,
  validateDateRange,
  statsController.getSalesByStatus
);

/**
 * GET /api/stats/by-period
 * Get sales grouped by time period
 * Requires: authentication, period query param (day/week/month)
 */
router.get(
  '/by-period',
  verifyAuth,
  validateDateRange,
  statsController.getSalesByPeriod
);

/**
 * GET /api/stats/recent
 * Get recent sales
 * Requires: authentication
 */
router.get(
  '/recent',
  verifyAuth,
  statsController.getRecentSales
);

/**
 * GET /api/stats/top-products
 * Get top products by sales count
 * Requires: authentication
 */
router.get(
  '/top-products',
  verifyAuth,
  validateDateRange,
  statsController.getTopProducts
);

/**
 * GET /api/stats/trends
 * Get sales trends for last N days
 * Requires: authentication
 */
router.get(
  '/trends',
  verifyAuth,
  statsController.getSalesTrends
);

module.exports = router;