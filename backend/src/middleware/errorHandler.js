const config = require('../config/env');

/**
 * Handles 404 Not Found errors
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * Custom error response for MongoDB validation errors
 * @param {Error} err - The error object
 * @returns {Object|null} - Processed error response or null if not a validation error
 */
const handleMongoValidationError = (err) => {
  if (err.name === 'ValidationError') {
    const errors = {};
    
    for (const field in err.errors) {
      errors[field] = err.errors[field].message;
    }
    
    return {
      status: 400,
      message: 'Validation Error',
      errors
    };
  }
  
  return null;
};

/**
 * Custom error response for MongoDB cast errors (invalid IDs)
 * @param {Error} err - The error object
 * @returns {Object|null} - Processed error response or null if not a cast error
 */
const handleMongoCastError = (err) => {
  if (err.name === 'CastError') {
    return {
      status: 400,
      message: `Invalid ${err.path}: ${err.value}`
    };
  }
  
  return null;
};

/**
 * Custom error response for MongoDB duplicate key errors
 * @param {Error} err - The error object
 * @returns {Object|null} - Processed error response or null if not a duplicate key error
 */
const handleMongoDuplicateKeyError = (err) => {
  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const field = Object.keys(err.keyPattern)[0];
    
    return {
      status: 400,
      message: `Duplicate field value: ${value} for field ${field}. Please use another value.`
    };
  }
  
  return null;
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Set default error status and message
  let error = { ...err };
  error.message = err.message;
  error.status = err.status || 500;
  
  // Log error in development mode
  if (config.isDevelopment) {
    console.error('Error:', err);
  }
  
  // Handle specific error types
  const mongoValidationError = handleMongoValidationError(err);
  if (mongoValidationError) {
    return res.status(mongoValidationError.status).json({
      status: 'error',
      ...mongoValidationError
    });
  }
  
  const mongoCastError = handleMongoCastError(err);
  if (mongoCastError) {
    return res.status(mongoCastError.status).json({
      status: 'error',
      ...mongoCastError
    });
  }
  
  const mongoDuplicateKeyError = handleMongoDuplicateKeyError(err);
  if (mongoDuplicateKeyError) {
    return res.status(mongoDuplicateKeyError.status).json({
      status: 'error',
      ...mongoDuplicateKeyError
    });
  }
  
  // Generic error response
  res.status(error.status).json({
    status: 'error',
    message: error.message,
    ...(config.isDevelopment && { stack: err.stack })
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
}; 