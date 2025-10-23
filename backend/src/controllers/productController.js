/**
 * Product Controller
 * Handles HTTP requests for products, franchises, and roles endpoints
 */

'use strict';

const { Product, Franchise, Role } = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse } = require('../utils/responses');
const { NotFoundError } = require('../utils/errors');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Get All Products
 * GET /api/products
 * Returns list of all products
 * @requires authMiddleware (verifyAuth)
 */
const getAllProducts = asyncHandler(async (req, res) => {
  // Get all products
  const products = await Product.findAll({
    attributes: ['id', 'nombre', 'tipo', 'descripcion'],
    order: [['id', 'ASC']]
  });

  // Format products
  const formattedProducts = products.map(product => ({
    id: product.id,
    nombre: product.nombre,
    tipo: product.tipo,
    descripcion: product.descripcion
  }));

  return successResponse(
    res,
    formattedProducts,
    'Products retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Get Product by ID
 * GET /api/products/:id
 * Returns a single product by ID
 * @requires authMiddleware (verifyAuth)
 */
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get product
  const product = await Product.findByPk(id, {
    attributes: ['id', 'nombre', 'tipo', 'descripcion']
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  return successResponse(
    res,
    {
      id: product.id,
      nombre: product.nombre,
      tipo: product.tipo,
      descripcion: product.descripcion
    },
    'Product retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Get All Franchises
 * GET /api/franchises
 * Returns list of all franchises
 * @requires authMiddleware (verifyAuth)
 */
const getAllFranchises = asyncHandler(async (req, res) => {
  // Get all franchises
  const franchises = await Franchise.findAll({
    attributes: ['id', 'nombre'],
    order: [['nombre', 'ASC']]
  });

  // Format franchises
  const formattedFranchises = franchises.map(franchise => ({
    id: franchise.id,
    nombre: franchise.nombre
  }));

  return successResponse(
    res,
    formattedFranchises,
    'Franchises retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Get Franchise by ID
 * GET /api/franchises/:id
 * Returns a single franchise by ID
 * @requires authMiddleware (verifyAuth)
 */
const getFranchiseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get franchise
  const franchise = await Franchise.findByPk(id, {
    attributes: ['id', 'nombre']
  });

  if (!franchise) {
    throw new NotFoundError('Franchise not found');
  }

  return successResponse(
    res,
    {
      id: franchise.id,
      nombre: franchise.nombre
    },
    'Franchise retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Get All Roles
 * GET /api/roles
 * Returns list of all roles
 * @requires authMiddleware (verifyAuth)
 * @requires roleMiddleware (isAdmin) - Only admins need to see roles
 */
const getAllRoles = asyncHandler(async (req, res) => {
  // Get all roles
  const roles = await Role.findAll({
    attributes: ['id', 'nombre', 'descripcion'],
    order: [['id', 'ASC']]
  });

  // Format roles
  const formattedRoles = roles.map(role => ({
    id: role.id,
    nombre: role.nombre,
    descripcion: role.descripcion
  }));

  return successResponse(
    res,
    formattedRoles,
    'Roles retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Get Product Types
 * GET /api/products/types
 * Returns list of unique product types
 * @requires authMiddleware (verifyAuth)
 */
const getProductTypes = asyncHandler(async (req, res) => {
  // Get all products and extract unique types
  const products = await Product.findAll({
    attributes: ['tipo'],
    group: ['tipo'],
    order: [['tipo', 'ASC']]
  });

  const types = products.map(product => product.tipo);

  return successResponse(
    res,
    types,
    'Product types retrieved successfully',
    HTTP_STATUS.OK
  );
});

module.exports = {
  getAllProducts,
  getProductById,
  getAllFranchises,
  getFranchiseById,
  getAllRoles,
  getProductTypes
};