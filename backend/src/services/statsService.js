/**
 * Statistics Service
 * Handles dashboard statistics and analytics with role-based access control
 */

'use strict';

const { Sale, Product, User, Role, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { ROLES, SALE_STATUSES } = require('../utils/constants');

/**
 * Build Where Clause with Role-Based Filtering
 * Admins see all sales, Advisors only see their own
 * @param {Number} userRolId - User's role ID
 * @param {Number} userId - User's ID
 * @param {Object} additionalFilters - Additional filter options
 * @returns {Object} Where clause for Sequelize query
 */
const buildWhereClause = (userRolId, userId, additionalFilters = {}) => {
  const whereClause = {};

  // Role-based filtering
  if (userRolId === ROLES.ADVISOR.ID) {
    // Advisors only see their own sales
    whereClause.usuarioCreadorId = userId;
  }
  // Admins see all sales

  // Apply additional filters
  const { startDate, endDate, productoId, estado } = additionalFilters;

  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) {
      whereClause.createdAt[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      whereClause.createdAt[Op.lte] = new Date(endDate);
    }
  }

  if (productoId) {
    whereClause.productoId = parseInt(productoId);
  }

  if (estado) {
    whereClause.estado = estado;
  }

  return whereClause;
};

/**
 * Get Dashboard Metrics
 * Returns key metrics for dashboard with role-based filtering
 * @param {Number} userRolId - Current user's role ID
 * @param {Number} userId - Current user's ID
 * @param {Object} filters - Filter options (startDate, endDate)
 * @returns {Object} Dashboard metrics
 */
const getDashboardMetrics = async (userRolId, userId, filters = {}) => {
  try {
    // Build where clause with role-based filtering
    const whereClause = buildWhereClause(userRolId, userId, filters);

    // Total sales count
    const totalSales = await Sale.count({
      where: whereClause
    });

    // Total sales amount
    const totalAmount = await Sale.sum('cupoSolicitado', {
      where: whereClause
    }) || 0;

    // Sales by status
    const salesByStatus = {
      open: await Sale.count({
        where: { ...whereClause, estado: SALE_STATUSES.OPEN }
      }),
      inProcess: await Sale.count({
        where: { ...whereClause, estado: SALE_STATUSES.IN_PROCESS }
      }),
      finished: await Sale.count({
        where: { ...whereClause, estado: SALE_STATUSES.FINISHED }
      })
    };

    // Average sale amount
    const averageAmount = totalSales > 0 ? totalAmount / totalSales : 0;

    logger.debug(`Dashboard metrics retrieved for user role: ${userRolId}`);

    return {
      totalSales,
      totalAmount: parseFloat(totalAmount),
      averageAmount: parseFloat(averageAmount.toFixed(2)),
      salesByStatus: {
        open: salesByStatus.open,
        inProcess: salesByStatus.inProcess,
        finished: salesByStatus.finished
      }
    };
  } catch (error) {
    logger.error('Error in getDashboardMetrics:', error);
    throw error;
  }
};

/**
 * Get Sales Grouped by Product
 * Returns sales aggregated by product type with role-based filtering
 * @param {Number} userRolId - Current user's role ID
 * @param {Number} userId - Current user's ID
 * @param {Object} filters - Filter options (startDate, endDate)
 * @returns {Array} Sales grouped by product
 */
const getSalesGroupedByProduct = async (userRolId, userId, filters = {}) => {
  try {
    // Build where clause with role-based filtering
    const whereClause = buildWhereClause(userRolId, userId, filters);

    // Query sales grouped by product
    const salesByProduct = await Sale.findAll({
      attributes: [
        'productoId',
        [sequelize.fn('COUNT', sequelize.col('Sale.id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('cupoSolicitado')), 'totalAmount'],
        [sequelize.fn('AVG', sequelize.col('cupoSolicitado')), 'averageAmount']
      ],
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'producto',
          attributes: ['id', 'nombre']
        }
      ],
      group: ['productoId', 'producto.id'],
      raw: false
    });

    // Format results
    const formattedResults = salesByProduct.map(item => ({
      productoId: item.productoId,
      productoNombre: item.producto.nombre,
      count: parseInt(item.dataValues.count),
      totalAmount: parseFloat(item.dataValues.totalAmount || 0),
      averageAmount: parseFloat(parseFloat(item.dataValues.averageAmount || 0).toFixed(2))
    }));

    // Sort by count descending
    formattedResults.sort((a, b) => b.count - a.count);

    logger.debug(`Sales by product retrieved for user role: ${userRolId}`);

    return formattedResults;
  } catch (error) {
    logger.error('Error in getSalesGroupedByProduct:', error);
    throw error;
  }
};

/**
 * Get Sales Grouped by Advisor
 * Returns sales aggregated by advisor (Admin only)
 * @param {Number} userRolId - Current user's role ID
 * @param {Object} filters - Filter options (startDate, endDate)
 * @returns {Array} Sales grouped by advisor
 */
const getSalesGroupedByAdvisor = async (userRolId, filters = {}) => {
  try {
    // Only admins can access this data
    if (userRolId !== ROLES.ADMIN.ID) {
      logger.warn('Unauthorized attempt to access sales by advisor');
      return [];
    }

    // Build where clause (no user filtering for admin)
    const whereClause = buildWhereClause(ROLES.ADMIN.ID, null, filters);

    // Query sales grouped by advisor
    const salesByAdvisor = await Sale.findAll({
      attributes: [
        'usuarioCreadorId',
        [sequelize.fn('COUNT', sequelize.col('Sale.id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('cupoSolicitado')), 'totalAmount'],
        [sequelize.fn('AVG', sequelize.col('cupoSolicitado')), 'averageAmount']
      ],
      where: whereClause,
      include: [
        {
          model: User,
          as: 'usuarioCreador',
          attributes: ['id', 'nombre', 'email'],
          include: [
            {
              model: Role,
              as: 'rol',
              attributes: ['nombre']
            }
          ]
        }
      ],
      group: ['usuarioCreadorId', 'usuarioCreador.id', 'usuarioCreador->rol.id'],
      raw: false
    });

    // Format results
    const formattedResults = salesByAdvisor.map(item => ({
      usuarioId: item.usuarioCreadorId,
      usuarioNombre: item.usuarioCreador.nombre,
      usuarioEmail: item.usuarioCreador.email,
      usuarioRol: item.usuarioCreador.rol.nombre,
      count: parseInt(item.dataValues.count),
      totalAmount: parseFloat(item.dataValues.totalAmount || 0),
      averageAmount: parseFloat(parseFloat(item.dataValues.averageAmount || 0).toFixed(2))
    }));

    // Sort by count descending
    formattedResults.sort((a, b) => b.count - a.count);

    logger.debug('Sales by advisor retrieved');

    return formattedResults;
  } catch (error) {
    logger.error('Error in getSalesGroupedByAdvisor:', error);
    throw error;
  }
};

/**
 * Get Sales Grouped by Status
 * Returns sales aggregated by status with role-based filtering
 * @param {Number} userRolId - Current user's role ID
 * @param {Number} userId - Current user's ID
 * @param {Object} filters - Filter options (startDate, endDate)
 * @returns {Array} Sales grouped by status
 */
const getSalesGroupedByStatus = async (userRolId, userId, filters = {}) => {
  try {
    // Build where clause with role-based filtering
    const whereClause = buildWhereClause(userRolId, userId, filters);

    // Query sales grouped by status
    const salesByStatus = await Sale.findAll({
      attributes: [
        'estado',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('cupoSolicitado')), 'totalAmount']
      ],
      where: whereClause,
      group: ['estado'],
      raw: true
    });

    // Format results
    const formattedResults = salesByStatus.map(item => ({
      estado: item.estado,
      count: parseInt(item.count),
      totalAmount: parseFloat(item.totalAmount || 0)
    }));

    logger.debug(`Sales by status retrieved for user role: ${userRolId}`);

    return formattedResults;
  } catch (error) {
    logger.error('Error in getSalesGroupedByStatus:', error);
    throw error;
  }
};

/**
 * Get Sales Grouped by Period
 * Returns sales aggregated by time period (daily, weekly, monthly) with role-based filtering
 * @param {String} period - Time period ('day', 'week', 'month')
 * @param {Number} userRolId - Current user's role ID
 * @param {Number} userId - Current user's ID
 * @param {Object} filters - Filter options (startDate, endDate)
 * @returns {Array} Sales grouped by period
 */
const getSalesGroupedByPeriod = async (period, userRolId, userId, filters = {}) => {
  try {
    // Build where clause with role-based filtering
    const whereClause = buildWhereClause(userRolId, userId, filters);

    // Determine date format based on period
    let dateFormat;
    switch (period) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u'; // Year-Week
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    // Query sales grouped by period
    const salesByPeriod = await Sale.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat), 'period'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('cupoSolicitado')), 'totalAmount']
      ],
      where: whereClause,
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat)],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat), 'ASC']],
      raw: true
    });

    // Format results
    const formattedResults = salesByPeriod.map(item => ({
      period: item.period,
      count: parseInt(item.count),
      totalAmount: parseFloat(item.totalAmount || 0)
    }));

    logger.debug(`Sales by period (${period}) retrieved for user role: ${userRolId}`);

    return formattedResults;
  } catch (error) {
    logger.error('Error in getSalesGroupedByPeriod:', error);
    throw error;
  }
};

/**
 * Get Recent Sales
 * Returns most recent sales with role-based filtering
 * @param {Number} userRolId - Current user's role ID
 * @param {Number} userId - Current user's ID
 * @param {Number} limit - Number of sales to retrieve (default: 5)
 * @returns {Array} Recent sales
 */
const getRecentSales = async (userRolId, userId, limit = 5) => {
  try {
    // Build where clause with role-based filtering
    const whereClause = buildWhereClause(userRolId, userId);

    // Query recent sales
    const recentSales = await Sale.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'producto',
          attributes: ['id', 'nombre']
        },
        {
          model: User,
          as: 'usuarioCreador',
          attributes: ['id', 'nombre']
        }
      ],
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    // Format results
    const formattedResults = recentSales.map(sale => ({
      id: sale.id,
      productoNombre: sale.producto.nombre,
      cupoSolicitado: parseFloat(sale.cupoSolicitado),
      estado: sale.estado,
      usuarioCreadorNombre: sale.usuarioCreador.nombre,
      createdAt: sale.createdAt
    }));

    logger.debug(`Retrieved ${formattedResults.length} recent sales for user role: ${userRolId}`);

    return formattedResults;
  } catch (error) {
    logger.error('Error in getRecentSales:', error);
    throw error;
  }
};

/**
 * Get Top Products
 * Returns products ranked by sales count with role-based filtering
 * @param {Number} userRolId - Current user's role ID
 * @param {Number} userId - Current user's ID
 * @param {Number} limit - Number of products to retrieve (default: 5)
 * @param {Object} filters - Filter options (startDate, endDate)
 * @returns {Array} Top products
 */
const getTopProducts = async (userRolId, userId, limit = 5, filters = {}) => {
  try {
    // Build where clause with role-based filtering
    const whereClause = buildWhereClause(userRolId, userId, filters);

    // Query top products
    const topProducts = await Sale.findAll({
      attributes: [
        'productoId',
        [sequelize.fn('COUNT', sequelize.col('Sale.id')), 'salesCount'],
        [sequelize.fn('SUM', sequelize.col('cupoSolicitado')), 'totalAmount']
      ],
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'producto',
          attributes: ['id', 'nombre']
        }
      ],
      group: ['productoId', 'producto.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Sale.id')), 'DESC']],
      limit: parseInt(limit),
      raw: false
    });

    // Format results
    const formattedResults = topProducts.map(item => ({
      productoId: item.productoId,
      productoNombre: item.producto.nombre,
      salesCount: parseInt(item.dataValues.salesCount),
      totalAmount: parseFloat(item.dataValues.totalAmount || 0)
    }));

    logger.debug(`Retrieved top ${formattedResults.length} products for user role: ${userRolId}`);

    return formattedResults;
  } catch (error) {
    logger.error('Error in getTopProducts:', error);
    throw error;
  }
};

/**
 * Get Comprehensive Dashboard
 * Returns all dashboard data in a single response
 * @param {Number} userRolId - Current user's role ID
 * @param {Number} userId - Current user's ID
 * @param {Object} filters - Filter options (startDate, endDate)
 * @returns {Object} Comprehensive dashboard data
 */
const getComprehensiveDashboard = async (userRolId, userId, filters = {}) => {
  try {
    // Execute all queries in parallel
    const [
      metrics,
      salesByProduct,
      salesByStatus,
      recentSales,
      topProducts,
      salesByAdvisor
    ] = await Promise.all([
      getDashboardMetrics(userRolId, userId, filters),
      getSalesGroupedByProduct(userRolId, userId, filters),
      getSalesGroupedByStatus(userRolId, userId, filters),
      getRecentSales(userRolId, userId, 5),
      getTopProducts(userRolId, userId, 5, filters),
      // Only fetch salesByAdvisor for admins
      userRolId === ROLES.ADMIN.ID
        ? getSalesGroupedByAdvisor(userRolId, filters)
        : Promise.resolve([])
    ]);

    logger.info(`Comprehensive dashboard retrieved for user role: ${userRolId}`);

    return {
      metrics,
      salesByProduct,
      salesByStatus,
      recentSales,
      topProducts,
      ...(userRolId === ROLES.ADMIN.ID && { salesByAdvisor })
    };
  } catch (error) {
    logger.error('Error in getComprehensiveDashboard:', error);
    throw error;
  }
};

module.exports = {
  getDashboardMetrics,
  getSalesGroupedByProduct,
  getSalesGroupedByAdvisor,
  getSalesGroupedByStatus,
  getSalesGroupedByPeriod,
  getRecentSales,
  getTopProducts,
  getComprehensiveDashboard
};