import app from './app.js';
import { logger } from './utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`CropPilotAI Backend API is running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});

// Handle unhandled rejections and uncaught exceptions gracefully
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection at:', promise);
  logger.error('Reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception caught:', err);
  process.exit(1);
});

// Graceful shutdown on SIGTERM / SIGINT
const handleShutdown = (signal) => {
  logger.info(`${signal} received. Closing CropPilotAI HTTP server gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed cleanly. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
