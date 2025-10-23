/**
 * Product Routes
 * Defines routes for products, franchises, and roles endpoints
 */

'use strict';

const express = require('express');
const router = express.Router();

// Controllers
const productController = require('../controllers/productController');

// Middleware
const { verifyAuth } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const { validateId } = require('../middleware/validationMiddleware');

/**
 * GET /api/products/types
 * Get all product types
 * Requires: authentication
 * Note: Must be before /:id route to avoid conflict
 */
router.get(
  '/products/types',
  verifyAuth,
  productController.getProductTypes
);

/**
 * GET /api/products
 * Get all products
 * Requires: authentication
 */
router.get(
  '/products',
  verifyAuth,
  productController.getAllProducts
);

/**
 * GET /api/products/:id
 * Get product by ID
 * Requires: authentication
 */
router.get(
  '/products/:id',
  verifyAuth,
  validateId,
  productController.getProductById
);

/**
 * GET /api/franchises
 * Get all franchises
 * Requires: authentication
 */
router.get(
  '/franchises',
  verifyAuth,
  productController.getAllFranchises
);

/**
 * GET /api/franchises/:id
 * Get franchise by ID
 * Requires: authentication
 */
router.get(
  '/franchises/:id',
  verifyAuth,
  validateId,
  productController.getFranchiseById
);

/**
 * GET /api/roles
 * Get all roles
 * Requires: authentication, admin role
 */
router.get(
  '/roles',
  verifyAuth,
  isAdmin,
  productController.getAllRoles
);

module.exports = router;