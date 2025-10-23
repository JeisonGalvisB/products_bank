/**
 * Product Service
 * Handles all product, franchise, and role API calls
 */

import api from './api';

const productService = {
  /**
   * Get All Products
   * @returns {Promise} Response with products list
   */
  getAllProducts: () => {
    return api.get('/products');
  },

  /**
   * Get Product by ID
   * @param {Number} id - Product ID
   * @returns {Promise} Response with product data
   */
  getProductById: (id) => {
    return api.get(`/products/${id}`);
  },

  /**
   * Get Product Types
   * @returns {Promise} Response with product types
   */
  getProductTypes: () => {
    return api.get('/products/types');
  },

  /**
   * Get All Franchises
   * @returns {Promise} Response with franchises list
   */
  getAllFranchises: () => {
    return api.get('/franchises');
  },

  /**
   * Get Franchise by ID
   * @param {Number} id - Franchise ID
   * @returns {Promise} Response with franchise data
   */
  getFranchiseById: (id) => {
    return api.get(`/franchises/${id}`);
  },

  /**
   * Get All Roles
   * @returns {Promise} Response with roles list (Admin only)
   */
  getAllRoles: () => {
    return api.get('/roles');
  }
};

export default productService;