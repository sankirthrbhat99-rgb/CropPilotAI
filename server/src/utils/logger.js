/**
 * Application Logger Utility
 * Provides structured logging with timestamps and log levels.
 */

const getTimestamp = () => new Date().toISOString();

export const logger = {
  info: (message, meta = {}) => {
    console.log(`[${getTimestamp()}] [INFO]: ${message}`, Object.keys(meta).length ? meta : '');
  },
  warn: (message, meta = {}) => {
    console.warn(`[${getTimestamp()}] [WARN]: ${message}`, Object.keys(meta).length ? meta : '');
  },
  error: (message, error = null) => {
    console.error(`[${getTimestamp()}] [ERROR]: ${message}`, error ? (error.stack || error) : '');
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${getTimestamp()}] [DEBUG]: ${message}`, Object.keys(meta).length ? meta : '');
    }
  }
};
