/**
 * Statistics Controller
 * Handles HTTP requests for statistics and dashboard endpoints with role-based access control
 */

'use strict';

const statsService = require('../services/statsService');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse } = require('../utils/responses');
const { ValidationError } = require('../utils/errors');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Get Dashboard Metrics
 * GET /api/stats/dashboard
 * Returns key metrics for dashboard with role-based filtering
 * @requires authMiddleware (verifyAuth)
 */
const getDashboardMetrics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const currentUser = req.user;

  // Build filters
  const filters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  // Get metrics with role-based filtering
  const metrics = await statsService.getDashboardMetrics(
    currentUser.rolId,
    currentUser.id,
    filters
  );

  return successResponse(
    res,
    metrics,
    'Dashboard metrics retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Get Sales by Product
 * GET /api/stats/by-product
 * Returns sales aggregated by product type with role-based filtering
 * @requires authMiddleware (verifyAuth)
 */
const getSalesByProduct = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const currentUser = req.user;

  // Build filters
  const filters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  // Get sales by product with role-based filtering
  const salesByProduct = await statsService.getSalesGroupedByProduct(
    currentUser.rolId,
    currentUser.id,
    filters
  );

  return successResponse(
    res,
    salesByProduct,
    'Sales by product retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Get Sales by Advisor
 * GET /api/stats/by-advisor
 * Returns sales aggregated by advisor (Admin only)
 * @requires authMiddleware (verifyAuth)
 * @requires roleMiddleware (isAdmin)
 */
const getSalesByAdvisor = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const currentUser = req.user;

  // Build filters
  const filters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  // Get sales by advisor (service validates admin role)
  const salesByAdvisor = await statsService.getSalesGroupedByAdvisor(
    currentUser.rolId,
    filters
  );

  return successResponse(
    res,
    salesByAdvisor,
    'Sales by advisor retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Get Sales by Status
 * GET /api/stats/by-status
 * Returns sales aggregated by status with role-based filtering
 * @requires authMiddleware (verifyAuth)
 */
const getSalesByStatus = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const currentUser = req.user;

  // Build filters
  const filters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  // Get sales by status with role-based filtering
  const salesByStatus = await statsService.getSalesGroupedByStatus(
    currentUser.rolId,
    currentUser.id,
    filters
  );

  return successResponse(
    res,
    salesByStatus,
    'Sales by status retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Get Sales by Period
 * GET /api/stats/by-period
 * Returns sales aggregated by time period with role-based filtering
 * @requires authMiddleware (verifyAuth)
 */
const getSalesByPeriod = asyncHandler(async (req, res) => {
  const { period, startDate, endDate } = req.query;
  const currentUser = req.user;

  // Validate period
  const validPeriods = ['day', 'week', 'month'];
  if (!period || !validPeriods.includes(period)) {
    throw new ValidationError('Valid period is required (day, week, or month)');
  }

  // Build filters
  const filters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  // Get sales by period with role-based filtering
  const salesByPeriod = await statsService.getSalesGroupedByPeriod(
    period,
    currentUser.rolId,
    currentUser.id,
    filters
  );

  return successResponse(
    res,
    salesByPeriod,
    `Sales by ${period} retrieved successfully`,
    HTTP_STATUS.OK
  );
});

/**
 * Get Recent Sales
 * GET /api/stats/recent
 * Returns most recent sales with role-based filtering
 * @requires authMiddleware (verifyAuth)
 */
const getRecentSales = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const currentUser = req.user;

  // Get recent sales with role-based filtering
  const recentSales = await statsService.getRecentSales(
    currentUser.rolId,
    currentUser.id,
    limit ? parseInt(limit) : 5
  );

  return successResponse(
    res,
    recentSales,
    'Recent sales retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Get Top Products
 * GET /api/stats/top-products
 * Returns products ranked by sales count with role-based filtering
 * @requires authMiddleware (verifyAuth)
 */
const getTopProducts = asyncHandler(async (req, res) => {
  const { limit, startDate, endDate } = req.query;
  const currentUser = req.user;

  // Build filters
  const filters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  // Get top products with role-based filtering
  const topProducts = await statsService.getTopProducts(
    currentUser.rolId,
    currentUser.id,
    limit ? parseInt(limit) : 5,
    filters
  );

  return successResponse(
    res,
    topProducts,
    'Top products retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Get Comprehensive Dashboard
 * GET /api/stats/comprehensive
 * Returns all dashboard data in a single response
 * Optimized endpoint for dashboard page
 * @requires authMiddleware (verifyAuth)
 */
const getComprehensiveDashboard = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const currentUser = req.user;

  // Build filters
  const filters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  // Get comprehensive dashboard with role-based filtering
  const dashboard = await statsService.getComprehensiveDashboard(
    currentUser.rolId,
    currentUser.id,
    filters
  );

  return successResponse(
    res,
    dashboard,
    'Comprehensive dashboard retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Get Sales Trends
 * GET /api/stats/trends
 * Returns sales trends for the last N days
 * @requires authMiddleware (verifyAuth)
 */
const getSalesTrends = asyncHandler(async (req, res) => {
  const { days } = req.query;
  const currentUser = req.user;

  // Default to last 30 days
  const numDays = days ? parseInt(days) : 30;

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - numDays);

  // Get sales by day
  const salesTrends = await statsService.getSalesGroupedByPeriod(
    'day',
    currentUser.rolId,
    currentUser.id,
    {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  );

  return successResponse(
    res,
    {
      period: `Last ${numDays} days`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      trends: salesTrends
    },
    'Sales trends retrieved successfully',
    HTTP_STATUS.OK
  );
});

module.exports = {
  getDashboardMetrics,
  getSalesByProduct,
  getSalesByAdvisor,
  getSalesByStatus,
  getSalesByPeriod,
  getRecentSales,
  getTopProducts,
  getComprehensiveDashboard,
  getSalesTrends
};