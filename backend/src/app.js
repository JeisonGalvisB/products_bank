/**
 * Express Application Setup
 * Main application file with complete middleware chain and routes
 */

'use strict';

require('dotenv').config();
const express = require('express');
const app = express();

// Logger
const logger = require('./utils/logger');

// Server configuration middleware
const { configureMiddleware } = require('./config/server');

// Routes
const routes = require('./routes');

// Error handling middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

/**
 * Configure Application Middleware
 * Order is important: security → parsing → logging → routes → error handling
 */

// 1. Apply server configuration (CORS, Helmet, Rate Limiting, Body Parser, Morgan)
configureMiddleware(app);

// 2. Mount API routes
app.use('/api', routes);

// 3. Root endpoint (outside /api prefix)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Products Bank API',
    version: '1.0.0',
    documentation: '/api',
    health: '/api/health'
  });
});

// 4. 404 handler (must be after all routes)
app.use(notFoundHandler);

// 5. Global error handler (must be last)
app.use(errorHandler);

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  logger.info('================================================');
  logger.info('🚀 Backend Server Started Successfully!');
  logger.info('================================================');
  logger.info(`📍 URL: http://localhost:${PORT}`);
  logger.info(`🌍 Environment: ${NODE_ENV}`);
  logger.info(`⏰ Started at: ${new Date().toLocaleString()}`);
  logger.info('================================================');
  logger.info('📝 Available API endpoints:');
  logger.info(`   GET    /api                    - API information`);
  logger.info(`   GET    /api/health             - Health check`);
  logger.info('');
  logger.info('   POST   /api/auth/login         - Login`');
  logger.info(`   POST   /api/auth/logout        - Logout`);
  logger.info(`   GET    /api/auth/verify        - Verify token`);
  logger.info(`   GET    /api/auth/profile       - Get profile`);
  logger.info('');
  logger.info(`   GET    /api/users              - List users (Admin)`);
  logger.info(`   POST   /api/users              - Create user (Admin)`);
  logger.info(`   GET    /api/users/:id          - Get user`);
  logger.info(`   PUT    /api/users/:id          - Update user`);
  logger.info(`   DELETE /api/users/:id          - Delete user (Admin)`);
  logger.info('');
  logger.info(`   GET    /api/sales              - List sales`);
  logger.info(`   POST   /api/sales              - Create sale`);
  logger.info(`   GET    /api/sales/:id          - Get sale`);
  logger.info(`   PUT    /api/sales/:id          - Update sale`);
  logger.info(`   DELETE /api/sales/:id          - Delete sale`);
  logger.info('');
  logger.info(`   GET    /api/products           - List products`);
  logger.info(`   GET    /api/franchises         - List franchises`);
  logger.info(`   GET    /api/roles              - List roles (Admin)`);
  logger.info('');
  logger.info(`   GET    /api/stats/dashboard    - Dashboard metrics`);
  logger.info(`   GET    /api/stats/comprehensive- Comprehensive dashboard`);
  logger.info(`   GET    /api/stats/by-product   - Sales by product`);
  logger.info(`   GET    /api/stats/by-advisor   - Sales by advisor (Admin)`);
  logger.info('================================================\n');
});

/**
 * Graceful Shutdown Handler
 */
const gracefulShutdown = (signal) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    logger.info('Server closed. All requests completed.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forcefully shutting down after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Export app for testing
module.exports = app;