const morgan = require('morgan');
const config = require('../config/env');

// Custom token for request body (for development only)
morgan.token('body', (req) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    // Don't log sensitive fields
    const safeBody = { ...req.body };
    
    // Remove sensitive fields if they exist
    if (safeBody.password) safeBody.password = '******';
    if (safeBody.apiKey) safeBody.apiKey = '******';
    if (safeBody.token) safeBody.token = '******';
    
    return JSON.stringify(safeBody);
  }
  return '';
});

// Format for development logs
const developmentFormat = ':method :url :status :response-time ms - :res[content-length] :body';

// Format for production logs
const productionFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

/**
 * Configure morgan logger based on environment
 */
const logger = () => {
  if (config.isDevelopment) {
    return morgan(developmentFormat, {
      skip: (req) => req.path === '/health' || req.path === '/favicon.ico'
    });
  }

  // For production
  return morgan(productionFormat, {
    skip: (req) => req.path === '/health' || req.path === '/favicon.ico'
  });
};

/**
 * Error logger
 */
const errorLogger = (err, req, res, next) => {
  // Log all errors in development, but only server errors in production
  if (config.isDevelopment || err.status >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.url} - Error:`, err);
  }
  next(err);
};

module.exports = {
  logger,
  errorLogger
}; 