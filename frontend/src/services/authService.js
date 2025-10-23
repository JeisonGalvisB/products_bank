/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import api from './api';

const authService = {
  /**
   * Login
   * @param {Object} credentials - { email, password, captchaToken }
   * @returns {Promise} Response with user data and token
   */
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  /**
   * Logout
   * @returns {Promise} Response
   */
  logout: () => {
    return api.post('/auth/logout');
  },

  /**
   * Verify Token
   * @returns {Promise} Response with user data
   */
  verifyToken: () => {
    return api.get('/auth/verify');
  },

  /**
   * Get Profile
   * @returns {Promise} Response with user profile
   */
  getProfile: () => {
    return api.get('/auth/profile');
  },

  /**
   * Change Password
   * @param {Object} passwords - { currentPassword, newPassword }
   * @returns {Promise} Response
   */
  changePassword: (passwords) => {
    return api.put('/auth/change-password', passwords);
  },

  /**
   * Refresh Token
   * @returns {Promise} Response with new token
   */
  refreshToken: () => {
    return api.post('/auth/refresh');
  }
};

export default authService;