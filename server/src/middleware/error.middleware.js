import { logger } from '../utils/logger.js';

/**
 * 404 Route Not Found Handler
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
};

/**
 * Global Error Handler
 * Suppresses internal stack traces in production mode.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(isProduction ? {} : { stack: err.stack })
  });
};
