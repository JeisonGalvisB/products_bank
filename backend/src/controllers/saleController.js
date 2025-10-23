/**
 * Sale Controller
 * Handles HTTP requests for sale management endpoints with role-based access control
 */

'use strict';

const saleService = require('../services/saleService');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse, createdResponse, deletedResponse } = require('../utils/responses');
const { HTTP_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Get All Sales
 * GET /api/sales
 * Returns list of sales with role-based filtering and pagination
 * Admins see all sales, Advisors only see their own
 * @requires authMiddleware (verifyAuth)
 */
const getAllSales = asyncHandler(async (req, res) => {
  const { productoId, estado, startDate, endDate, usuarioCreadorId, page, limit } = req.query;
  const currentUser = req.user;

  // Build filters
  const filters = {};
  if (productoId) filters.productoId = parseInt(productoId);
  if (estado) filters.estado = estado;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;
  if (usuarioCreadorId) filters.usuarioCreadorId = parseInt(usuarioCreadorId);

  // Build pagination
  const pagination = {};
  if (page) pagination.page = parseInt(page);
  if (limit) pagination.limit = parseInt(limit);

  // Get sales with role-based filtering
  const result = await saleService.findAllSales(
    filters,
    currentUser.rolId,
    currentUser.id,
    pagination
  );

  return successResponse(
    res,
    result,
    'Sales retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Get Sale by ID
 * GET /api/sales/:id
 * Returns a single sale by ID with role-based access check
 * @requires authMiddleware (verifyAuth)
 */
const getSaleById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  // Get sale (service checks authorization)
  const sale = await saleService.findSaleById(
    parseInt(id),
    currentUser.rolId,
    currentUser.id
  );

  return successResponse(
    res,
    sale,
    'Sale retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Create Sale
 * POST /api/sales
 * Creates a new sale
 * @requires authMiddleware (verifyAuth)
 */
const createSale = asyncHandler(async (req, res) => {
  const { productoId, cupoSolicitado, franquiciaId, tasa, estado } = req.body;
  const currentUser = req.user;

  // Create sale data
  const saleData = {
    productoId,
    cupoSolicitado,
    franquiciaId,
    tasa,
    estado
  };

  // Create sale (user ID will be set as creator)
  const sale = await saleService.createNewSale(saleData, currentUser.id);

  logger.info(`Sale created: ID ${sale.id} by user ${currentUser.email}`);

  return createdResponse(
    res,
    sale,
    'Sale created successfully'
  );
});

/**
 * Update Sale
 * PUT /api/sales/:id
 * Updates an existing sale with role-based access check
 * @requires authMiddleware (verifyAuth)
 */
const updateSale = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { productoId, cupoSolicitado, franquiciaId, tasa, estado } = req.body;
  const currentUser = req.user;

  // Build update data
  const updateData = {};
  if (productoId !== undefined) updateData.productoId = productoId;
  if (cupoSolicitado !== undefined) updateData.cupoSolicitado = cupoSolicitado;
  if (franquiciaId !== undefined) updateData.franquiciaId = franquiciaId;
  if (tasa !== undefined) updateData.tasa = tasa;
  if (estado !== undefined) updateData.estado = estado;

  // Update sale (service checks authorization)
  const sale = await saleService.updateSaleById(
    parseInt(id),
    updateData,
    currentUser.rolId,
    currentUser.id
  );

  logger.info(`Sale updated: ID ${id} by user ${currentUser.email}`);

  return successResponse(
    res,
    sale,
    'Sale updated successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Delete Sale
 * DELETE /api/sales/:id
 * Deletes a sale with role-based access check
 * @requires authMiddleware (verifyAuth)
 */
const deleteSale = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  // Delete sale (service checks authorization)
  await saleService.deleteSaleById(
    parseInt(id),
    currentUser.rolId,
    currentUser.id
  );

  logger.info(`Sale deleted: ID ${id} by user ${currentUser.email}`);

  return deletedResponse(
    res,
    'Sale deleted successfully'
  );
});

/**
 * Get Total Sales Amount
 * GET /api/sales/total
 * Calculates sum of cupoSolicitado with role-based filtering
 * @requires authMiddleware (verifyAuth)
 */
const getTotalAmount = asyncHandler(async (req, res) => {
  const { productoId, estado, startDate, endDate } = req.query;
  const currentUser = req.user;

  // Build filters
  const filters = {};
  if (productoId) filters.productoId = parseInt(productoId);
  if (estado) filters.estado = estado;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  // Calculate total with role-based filtering
  const total = await saleService.calculateTotalAmount(
    currentUser.rolId,
    currentUser.id,
    filters
  );

  return successResponse(
    res,
    { total },
    'Total amount calculated successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Get Sales Count by Status
 * GET /api/sales/count-by-status
 * Returns count of sales grouped by status with role-based filtering
 * @requires authMiddleware (verifyAuth)
 */
const getCountByStatus = asyncHandler(async (req, res) => {
  const currentUser = req.user;

  // Get counts with role-based filtering
  const counts = await saleService.getSalesCountByStatus(
    currentUser.rolId,
    currentUser.id
  );

  return successResponse(
    res,
    counts,
    'Sales count by status retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Get My Sales
 * GET /api/sales/my-sales
 * Returns sales created by the current user
 * Convenience endpoint for advisors (admins can also use it)
 * @requires authMiddleware (verifyAuth)
 */
const getMySales = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const currentUser = req.user;

  // Build pagination
  const pagination = {};
  if (page) pagination.page = parseInt(page);
  if (limit) pagination.limit = parseInt(limit);

  // Get sales filtered by current user
  const result = await saleService.findAllSales(
    { usuarioCreadorId: currentUser.id },
    currentUser.rolId,
    currentUser.id,
    pagination
  );

  return successResponse(
    res,
    result,
    'My sales retrieved successfully',
    HTTP_STATUS.OK
  );
});

module.exports = {
  getAllSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  getTotalAmount,
  getCountByStatus,
  getMySales
};