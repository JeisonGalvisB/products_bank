/**
 * Sale Service
 * Handles all sale management API calls with role-based access
 */

import api from './api';

const saleService = {
  /**
   * Get All Sales
   * @param {Object} params - { productoId, estado, startDate, endDate, usuarioCreadorId, page, limit }
   * @returns {Promise} Response with sales list and pagination (role-based filtered)
   */
  getAllSales: (params = {}) => {
    return api.get('/sales', { params });
  },

  /**
   * Get Sale by ID
   * @param {Number} id - Sale ID
   * @returns {Promise} Response with sale data
   */
  getSaleById: (id) => {
    return api.get(`/sales/${id}`);
  },

  /**
   * Create Sale
   * @param {Object} saleData - { productoId, cupoSolicitado, franquiciaId, tasa, estado }
   * @returns {Promise} Response with created sale
   */
  createSale: (saleData) => {
    return api.post('/sales', saleData);
  },

  /**
   * Update Sale
   * @param {Number} id - Sale ID
   * @param {Object} saleData - { productoId, cupoSolicitado, franquiciaId, tasa, estado }
   * @returns {Promise} Response with updated sale
   */
  updateSale: (id, saleData) => {
    return api.put(`/sales/${id}`, saleData);
  },

  /**
   * Delete Sale
   * @param {Number} id - Sale ID
   * @returns {Promise} Response
   */
  deleteSale: (id) => {
    return api.delete(`/sales/${id}`);
  },

  /**
   * Get Total Sales Amount
   * @param {Object} params - { productoId, estado, startDate, endDate }
   * @returns {Promise} Response with total amount
   */
  getTotalAmount: (params = {}) => {
    return api.get('/sales/total', { params });
  },

  /**
   * Get Sales Count by Status
   * @returns {Promise} Response with counts by status
   */
  getCountByStatus: () => {
    return api.get('/sales/count-by-status');
  },

  /**
   * Get My Sales
   * @param {Object} params - { page, limit }
   * @returns {Promise} Response with current user's sales
   */
  getMySales: (params = {}) => {
    return api.get('/sales/my-sales', { params });
  }
};

export default saleService;