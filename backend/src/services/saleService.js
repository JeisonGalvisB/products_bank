/**
 * Sale Service
 * Handles sale CRUD operations with role-based access control
 */

'use strict';

const { Sale, Product, Franchise, User, Role } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { NotFoundError, ValidationError, AuthorizationError } = require('../utils/errors');
const logger = require('../utils/logger');
const { ROLES, PRODUCTS, SALE_STATUS } = require('../utils/constants');

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
  // Admins see all sales (no additional where clause needed)

  // Apply additional filters
  const { productoId, estado, startDate, endDate, usuarioCreadorId } = additionalFilters;

  if (productoId) {
    whereClause.productoId = parseInt(productoId);
  }

  if (estado) {
    whereClause.estado = estado;
  }

  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) {
      whereClause.createdAt[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      whereClause.createdAt[Op.lte] = new Date(endDate);
    }
  }

  // Allow admin to filter by specific advisor
  if (usuarioCreadorId && userRolId === ROLES.ADMIN.ID) {
    whereClause.usuarioCreadorId = parseInt(usuarioCreadorId);
  }

  return whereClause;
};

/**
 * Find All Sales
 * Retrieves sales with role-based filtering and pagination
 * @param {Object} filters - Filter options (productoId, estado, startDate, endDate, usuarioCreadorId)
 * @param {Number} userRolId - Current user's role ID
 * @param {Number} userId - Current user's ID
 * @param {Object} pagination - Pagination options (page, limit)
 * @returns {Object} Sales list with pagination metadata
 */
const findAllSales = async (filters = {}, userRolId, userId, pagination = {}) => {
  try {
    const { page = 1, limit = 10 } = pagination;

    // Build where clause with role-based filtering
    const whereClause = buildWhereClause(userRolId, userId, filters);

    // Calculate offset
    const offset = (page - 1) * limit;

    // Query sales
    const { count, rows: sales } = await Sale.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'producto',
          attributes: ['id', 'nombre', 'tipo']
        },
        {
          model: Franchise,
          as: 'franquicia',
          attributes: ['id', 'nombre'],
          required: false // Left join (some sales don't have franchise)
        },
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
        },
        {
          model: User,
          as: 'usuarioActualizador',
          attributes: ['id', 'nombre'],
          required: false // Left join (may not have been updated yet)
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    // Format sales
    const formattedSales = sales.map(sale => ({
      id: sale.id,
      productoId: sale.productoId,
      productoNombre: sale.producto.nombre,
      productoTipo: sale.producto.tipo,
      cupoSolicitado: parseFloat(sale.cupoSolicitado),
      franquiciaId: sale.franquiciaId,
      franquiciaNombre: sale.franquicia ? sale.franquicia.nombre : null,
      tasa: sale.tasa ? parseFloat(sale.tasa) : null,
      estado: sale.estado,
      usuarioCreadorId: sale.usuarioCreadorId,
      usuarioCreadorNombre: sale.usuarioCreador.nombre,
      usuarioCreadorEmail: sale.usuarioCreador.email,
      usuarioCreadorRol: sale.usuarioCreador.rol.nombre,
      usuarioActualizadorId: sale.usuarioActualizadorId,
      usuarioActualizadorNombre: sale.usuarioActualizador ? sale.usuarioActualizador.nombre : null,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt
    }));

    logger.debug(`Retrieved ${sales.length} sales (total: ${count}) for user role: ${userRolId}`);

    // Return with pagination metadata
    return {
      sales: formattedSales,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    logger.error('Error in findAllSales:', error);
    throw error;
  }
};

/**
 * Find Sale by ID
 * Retrieves a single sale with role-based access check
 * @param {Number} id - Sale ID
 * @param {Number} userRolId - Current user's role ID
 * @param {Number} userId - Current user's ID
 * @returns {Object} Sale data
 */
const findSaleById = async (id, userRolId, userId) => {
  try {
    const sale = await Sale.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'producto',
          attributes: ['id', 'nombre', 'tipo', 'descripcion']
        },
        {
          model: Franchise,
          as: 'franquicia',
          attributes: ['id', 'nombre'],
          required: false
        },
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
        },
        {
          model: User,
          as: 'usuarioActualizador',
          attributes: ['id', 'nombre', 'email'],
          required: false
        }
      ]
    });

    if (!sale) {
      throw new NotFoundError('Sale not found');
    }

    // Check authorization: Advisors can only view their own sales
    if (userRolId === ROLES.ADVISOR.ID && sale.usuarioCreadorId !== userId) {
      throw new AuthorizationError('You can only view your own sales');
    }

    logger.debug(`Retrieved sale ID: ${id}`);

    return {
      id: sale.id,
      productoId: sale.productoId,
      productoNombre: sale.producto.nombre,
      productoTipo: sale.producto.tipo,
      productoDescripcion: sale.producto.descripcion,
      cupoSolicitado: parseFloat(sale.cupoSolicitado),
      franquiciaId: sale.franquiciaId,
      franquiciaNombre: sale.franquicia ? sale.franquicia.nombre : null,
      tasa: sale.tasa ? parseFloat(sale.tasa) : null,
      estado: sale.estado,
      usuarioCreadorId: sale.usuarioCreadorId,
      usuarioCreadorNombre: sale.usuarioCreador.nombre,
      usuarioCreadorEmail: sale.usuarioCreador.email,
      usuarioCreadorRol: sale.usuarioCreador.rol.nombre,
      usuarioActualizadorId: sale.usuarioActualizadorId,
      usuarioActualizadorNombre: sale.usuarioActualizador ? sale.usuarioActualizador.nombre : null,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt
    };
  } catch (error) {
    // Re-throw known errors
    if (error instanceof NotFoundError || error instanceof AuthorizationError) {
      throw error;
    }

    logger.error('Error in findSaleById:', error);
    throw error;
  }
};

/**
 * Create New Sale
 * Creates a new sale with validation
 * @param {Object} saleData - Sale data
 * @param {Number} userId - Current user's ID (will be set as creator)
 * @returns {Object} Created sale data
 */
const createNewSale = async (saleData, userId) => {
  try {
    const { productoId, cupoSolicitado, franquiciaId, tasa, estado } = saleData;

    // Validate required fields
    if (!productoId || !cupoSolicitado) {
      throw new ValidationError('Product and requested amount are required');
    }

    // Validate product exists
    const product = await Product.findByPk(productoId);
    if (!product) {
      throw new ValidationError('Invalid product ID');
    }

    // Conditional validation: Franchise required for credit cards
    if (parseInt(productoId) === PRODUCTS.CREDIT_CARD.ID && !franquiciaId) {
      throw new ValidationError('Franchise is required for credit cards');
    }

    // Conditional validation: Franchise only allowed for credit cards
    if (parseInt(productoId) !== PRODUCTS.CREDIT_CARD.ID && franquiciaId) {
      throw new ValidationError('Franchise is only applicable to credit cards');
    }

    // Validate franchise if provided
    if (franquiciaId) {
      const franchise = await Franchise.findByPk(franquiciaId);
      if (!franchise) {
        throw new ValidationError('Invalid franchise ID');
      }
    }

    // Conditional validation: Rate required for credits and payrolls
    const productId = parseInt(productoId);
    if ((productId === PRODUCTS.CONSUMER_CREDIT.ID ||
         productId === PRODUCTS.FREE_INVESTMENT_PAYROLL.ID) && !tasa) {
      throw new ValidationError('Rate is required for credits and payrolls');
    }

    // Conditional validation: Rate only allowed for credits and payrolls
    if (productId !== PRODUCTS.CONSUMER_CREDIT.ID &&
        productId !== PRODUCTS.FREE_INVESTMENT_PAYROLL.ID &&
        tasa !== undefined && tasa !== null) {
      throw new ValidationError('Rate is only applicable to credits and payrolls');
    }

    // Create sale
    const sale = await Sale.create({
      productoId: parseInt(productoId),
      cupoSolicitado: parseFloat(cupoSolicitado),
      franquiciaId: franquiciaId ? parseInt(franquiciaId) : null,
      tasa: tasa ? parseFloat(tasa) : null,
      estado: estado || SALE_STATUS.OPEN,
      usuarioCreadorId: userId,
      usuarioActualizadorId: userId
    });

    // Load created sale with associations
    const createdSale = await Sale.findByPk(sale.id, {
      include: [
        {
          model: Product,
          as: 'producto',
          attributes: ['id', 'nombre', 'tipo']
        },
        {
          model: Franchise,
          as: 'franquicia',
          attributes: ['id', 'nombre'],
          required: false
        },
        {
          model: User,
          as: 'usuarioCreador',
          attributes: ['id', 'nombre', 'email']
        }
      ]
    });

    logger.info(`Sale created: ID ${createdSale.id} by user ${userId}`);

    return {
      id: createdSale.id,
      productoId: createdSale.productoId,
      productoNombre: createdSale.producto.nombre,
      cupoSolicitado: parseFloat(createdSale.cupoSolicitado),
      franquiciaId: createdSale.franquiciaId,
      franquiciaNombre: createdSale.franquicia ? createdSale.franquicia.nombre : null,
      tasa: createdSale.tasa ? parseFloat(createdSale.tasa) : null,
      estado: createdSale.estado,
      usuarioCreadorId: createdSale.usuarioCreadorId,
      usuarioCreadorNombre: createdSale.usuarioCreador.nombre,
      createdAt: createdSale.createdAt
    };
  } catch (error) {
    // Re-throw known errors
    if (error instanceof ValidationError) {
      throw error;
    }

    logger.error('Error in createNewSale:', error);
    throw error;
  }
};

/**
 * Update Sale by ID
 * Updates sale with validation and authorization check
 * @param {Number} id - Sale ID
 * @param {Object} saleData - Sale data to update
 * @param {Number} userRolId - Current user's role ID
 * @param {Number} userId - Current user's ID
 * @returns {Object} Updated sale data
 */
const updateSaleById = async (id, saleData, userRolId, userId) => {
  try {
    // Find sale
    const sale = await Sale.findByPk(id);

    if (!sale) {
      throw new NotFoundError('Sale not found');
    }

    // Check authorization: Advisors can only update their own sales
    if (userRolId === ROLES.ADVISOR.ID && sale.usuarioCreadorId !== userId) {
      throw new AuthorizationError('You can only update your own sales');
    }

    // Build update object
    const updateData = {};

    if (saleData.productoId !== undefined) {
      // Validate product exists
      const product = await Product.findByPk(saleData.productoId);
      if (!product) {
        throw new ValidationError('Invalid product ID');
      }
      updateData.productoId = parseInt(saleData.productoId);
    }

    if (saleData.cupoSolicitado !== undefined) {
      updateData.cupoSolicitado = parseFloat(saleData.cupoSolicitado);
    }

    if (saleData.franquiciaId !== undefined) {
      if (saleData.franquiciaId !== null) {
        // Validate franchise exists
        const franchise = await Franchise.findByPk(saleData.franquiciaId);
        if (!franchise) {
          throw new ValidationError('Invalid franchise ID');
        }
        updateData.franquiciaId = parseInt(saleData.franquiciaId);
      } else {
        updateData.franquiciaId = null;
      }
    }

    if (saleData.tasa !== undefined) {
      updateData.tasa = saleData.tasa !== null ? parseFloat(saleData.tasa) : null;
    }

    if (saleData.estado !== undefined) {
      // Validate status
      const validStatuses = [SALE_STATUS.OPEN, SALE_STATUS.IN_PROCESS, SALE_STATUS.FINISHED];
      if (!validStatuses.includes(saleData.estado)) {
        throw new ValidationError('Invalid status');
      }
      updateData.estado = saleData.estado;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('No fields to update');
    }

    // Set updater
    updateData.usuarioActualizadorId = userId;

    // Update sale
    await sale.update(updateData);

    // Load updated sale with associations
    const updatedSale = await Sale.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'producto',
          attributes: ['id', 'nombre', 'tipo']
        },
        {
          model: Franchise,
          as: 'franquicia',
          attributes: ['id', 'nombre'],
          required: false
        },
        {
          model: User,
          as: 'usuarioActualizador',
          attributes: ['id', 'nombre']
        }
      ]
    });

    logger.info(`Sale updated: ID ${id} by user ${userId}`);

    return {
      id: updatedSale.id,
      productoId: updatedSale.productoId,
      productoNombre: updatedSale.producto.nombre,
      cupoSolicitado: parseFloat(updatedSale.cupoSolicitado),
      franquiciaId: updatedSale.franquiciaId,
      franquiciaNombre: updatedSale.franquicia ? updatedSale.franquicia.nombre : null,
      tasa: updatedSale.tasa ? parseFloat(updatedSale.tasa) : null,
      estado: updatedSale.estado,
      usuarioActualizadorId: updatedSale.usuarioActualizadorId,
      usuarioActualizadorNombre: updatedSale.usuarioActualizador.nombre,
      updatedAt: updatedSale.updatedAt
    };
  } catch (error) {
    // Re-throw known errors
    if (error instanceof NotFoundError ||
        error instanceof AuthorizationError ||
        error instanceof ValidationError) {
      throw error;
    }

    logger.error('Error in updateSaleById:', error);
    throw error;
  }
};

/**
 * Delete Sale by ID
 * Deletes a sale with authorization check
 * @param {Number} id - Sale ID
 * @param {Number} userRolId - Current user's role ID
 * @param {Number} userId - Current user's ID
 * @returns {Boolean} Success status
 */
const deleteSaleById = async (id, userRolId, userId) => {
  try {
    // Find sale
    const sale = await Sale.findByPk(id);

    if (!sale) {
      throw new NotFoundError('Sale not found');
    }

    // Check authorization: Advisors can only delete their own sales
    if (userRolId === ROLES.ADVISOR.ID && sale.usuarioCreadorId !== userId) {
      throw new AuthorizationError('You can only delete your own sales');
    }

    // Delete sale
    await sale.destroy();

    logger.info(`Sale deleted: ID ${id} by user ${userId}`);

    return true;
  } catch (error) {
    // Re-throw known errors
    if (error instanceof NotFoundError || error instanceof AuthorizationError) {
      throw error;
    }

    logger.error('Error in deleteSaleById:', error);
    throw error;
  }
};

/**
 * Calculate Total Amount
 * Calculates sum of cupoSolicitado with role-based filtering
 * @param {Number} userRolId - Current user's role ID
 * @param {Number} userId - Current user's ID
 * @param {Object} filters - Filter options
 * @returns {Number} Total amount
 */
const calculateTotalAmount = async (userRolId, userId, filters = {}) => {
  try {
    // Build where clause with role-based filtering
    const whereClause = buildWhereClause(userRolId, userId, filters);

    // Calculate sum
    const result = await Sale.sum('cupoSolicitado', {
      where: whereClause
    });

    const total = result || 0;

    logger.debug(`Calculated total amount: ${total} for user role: ${userRolId}`);

    return parseFloat(total);
  } catch (error) {
    logger.error('Error in calculateTotalAmount:', error);
    throw error;
  }
};

/**
 * Get Sales Count by Status
 * Returns count of sales grouped by status with role-based filtering
 * @param {Number} userRolId - Current user's role ID
 * @param {Number} userId - Current user's ID
 * @returns {Object} Sale counts by status
 */
const getSalesCountByStatus = async (userRolId, userId) => {
  try {
    // Build base where clause with role-based filtering
    const baseWhereClause = buildWhereClause(userRolId, userId);

    const openCount = await Sale.count({
      where: { ...baseWhereClause, estado: SALE_STATUS.OPEN }
    });

    const inProcessCount = await Sale.count({
      where: { ...baseWhereClause, estado: SALE_STATUS.IN_PROCESS }
    });

    const finishedCount = await Sale.count({
      where: { ...baseWhereClause, estado: SALE_STATUS.FINISHED }
    });

    return {
      open: openCount,
      inProcess: inProcessCount,
      finished: finishedCount,
      total: openCount + inProcessCount + finishedCount
    };
  } catch (error) {
    logger.error('Error in getSalesCountByStatus:', error);
    throw error;
  }
};

module.exports = {
  findAllSales,
  findSaleById,
  createNewSale,
  updateSaleById,
  deleteSaleById,
  calculateTotalAmount,
  getSalesCountByStatus
};