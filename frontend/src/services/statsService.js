/**
 * Statistics Service
 * Handles all statistics and dashboard API calls
 */

import api from './api';

const statsService = {
  /**
   * Get Dashboard Metrics
   * @param {Object} params - { startDate, endDate }
   * @returns {Promise} Response with dashboard metrics
   */
  getDashboardMetrics: (params = {}) => {
    return api.get('/stats/dashboard', { params });
  },

  /**
   * Get Comprehensive Dashboard
   * @param {Object} params - { startDate, endDate }
   * @returns {Promise} Response with complete dashboard data
   */
  getComprehensiveDashboard: (params = {}) => {
    return api.get('/stats/comprehensive', { params });
  },

  /**
   * Get Sales by Product
   * @param {Object} params - { startDate, endDate }
   * @returns {Promise} Response with sales grouped by product
   */
  getSalesByProduct: (params = {}) => {
    return api.get('/stats/by-product', { params });
  },

  /**
   * Get Sales by Advisor
   * @param {Object} params - { startDate, endDate }
   * @returns {Promise} Response with sales grouped by advisor (Admin only)
   */
  getSalesByAdvisor: (params = {}) => {
    return api.get('/stats/by-advisor', { params });
  },

  /**
   * Get Sales by Status
   * @param {Object} params - { startDate, endDate }
   * @returns {Promise} Response with sales grouped by status
   */
  getSalesByStatus: (params = {}) => {
    return api.get('/stats/by-status', { params });
  },

  /**
   * Get Sales by Period
   * @param {Object} params - { period, startDate, endDate }
   * @returns {Promise} Response with sales grouped by period
   */
  getSalesByPeriod: (params = {}) => {
    return api.get('/stats/by-period', { params });
  },

  /**
   * Get Recent Sales
   * @param {Object} params - { limit }
   * @returns {Promise} Response with recent sales
   */
  getRecentSales: (params = {}) => {
    return api.get('/stats/recent', { params });
  },

  /**
   * Get Top Products
   * @param {Object} params - { limit, startDate, endDate }
   * @returns {Promise} Response with top products
   */
  getTopProducts: (params = {}) => {
    return api.get('/stats/top-products', { params });
  },

  /**
   * Get Sales Trends
   * @param {Object} params - { days }
   * @returns {Promise} Response with sales trends
   */
  getSalesTrends: (params = {}) => {
    return api.get('/stats/trends', { params });
  }
};

export default statsService;