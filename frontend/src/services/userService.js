/**
 * User Service
 * Handles all user management API calls
 */

import api from './api';

const userService = {
  /**
   * Get All Users
   * @param {Object} params - { search, rolId, page, limit }
   * @returns {Promise} Response with users list and pagination
   */
  getAllUsers: (params = {}) => {
    return api.get('/users', { params });
  },

  /**
   * Get User by ID
   * @param {Number} id - User ID
   * @returns {Promise} Response with user data
   */
  getUserById: (id) => {
    return api.get(`/users/${id}`);
  },

  /**
   * Create User
   * @param {Object} userData - { nombre, email, password, rolId }
   * @returns {Promise} Response with created user
   */
  createUser: (userData) => {
    return api.post('/users', userData);
  },

  /**
   * Update User
   * @param {Number} id - User ID
   * @param {Object} userData - { nombre, email, password, rolId }
   * @returns {Promise} Response with updated user
   */
  updateUser: (id, userData) => {
    return api.put(`/users/${id}`, userData);
  },

  /**
   * Delete User
   * @param {Number} id - User ID
   * @returns {Promise} Response
   */
  deleteUser: (id) => {
    return api.delete(`/users/${id}`);
  },

  /**
   * Check Email Availability
   * @param {String} email - Email to check
   * @param {Number} excludeUserId - User ID to exclude from check
   * @returns {Promise} Response with availability status
   */
  checkEmail: (email, excludeUserId = null) => {
    return api.get('/users/check-email', {
      params: { email, excludeUserId }
    });
  },

  /**
   * Get Users Count by Role
   * @returns {Promise} Response with user counts
   */
  getUsersCountByRole: () => {
    return api.get('/users/count-by-role');
  }
};

export default userService;