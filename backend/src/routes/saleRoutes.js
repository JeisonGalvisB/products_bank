/**
 * Sale Routes
 * Defines routes for sale management endpoints with role-based access control
 */

'use strict';

const express = require('express');
const router = express.Router();

// Controllers
const saleController = require('../controllers/saleController');

// Middleware
const { verifyAuth } = require('../middleware/authMiddleware');
const {
  validateSaleCreate,
  validateSaleUpdate,
  validateId,
  validatePagination,
  validateDateRange
} = require('../middleware/validationMiddleware');

/**
 * GET /api/sales/total
 * Get total sales amount with optional filters
 * Requires: authentication
 * Note: Must be before /:id route to avoid conflict
 */
router.get(
  '/total',
  verifyAuth,
  validateDateRange,
  saleController.getTotalAmount
);

/**
 * GET /api/sales/count-by-status
 * Get sales count grouped by status
 * Requires: authentication
 * Note: Must be before /:id route to avoid conflict
 */
router.get(
  '/count-by-status',
  verifyAuth,
  saleController.getCountByStatus
);

/**
 * GET /api/sales/my-sales
 * Get sales created by current user
 * Requires: authentication
 * Note: Must be before /:id route to avoid conflict
 */
router.get(
  '/my-sales',
  verifyAuth,
  validatePagination,
  saleController.getMySales
);

/**
 * GET /api/sales
 * Get all sales with role-based filtering and pagination
 * Admins see all, Advisors only see their own
 * Requires: authentication
 */
router.get(
  '/',
  verifyAuth,
  validatePagination,
  validateDateRange,
  saleController.getAllSales
);

/**
 * GET /api/sales/:id
 * Get sale by ID with role-based access check
 * Requires: authentication
 */
router.get(
  '/:id',
  verifyAuth,
  validateId,
  saleController.getSaleById
);

/**
 * POST /api/sales
 * Create new sale
 * Requires: authentication, validation
 */
router.post(
  '/',
  verifyAuth,
  validateSaleCreate,
  saleController.createSale
);

/**
 * PUT /api/sales/:id
 * Update sale with role-based access check
 * Requires: authentication, validation
 */
router.put(
  '/:id',
  verifyAuth,
  validateId,
  validateSaleUpdate,
  saleController.updateSale
);

/**
 * DELETE /api/sales/:id
 * Delete sale with role-based access check
 * Requires: authentication
 */
router.delete(
  '/:id',
  verifyAuth,
  validateId,
  saleController.deleteSale
);

module.exports = router;