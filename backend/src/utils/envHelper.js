/**
 * Utility functions for working with environment variables
 */
const config = require('../config/env');

/**
 * Get an environment variable with a fallback value
 * @param {string} key - The environment variable name
 * @param {*} defaultValue - The default value if not found
 * @returns {*} The environment variable value or default
 */
const getEnvVar = (key, defaultValue) => {
  return process.env[key] || defaultValue;
};

/**
 * Check if all required environment variables are set
 * @param {string[]} requiredVars - Array of required variable names
 * @returns {boolean} True if all variables are set
 */
const checkRequiredVars = (requiredVars) => {
  const missing = requiredVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  return true;
};

/**
 * Get a boolean environment variable
 * @param {string} key - The environment variable name
 * @param {boolean} defaultValue - Default value if not found
 * @returns {boolean} The parsed boolean value
 */
const getBoolEnvVar = (key, defaultValue = false) => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return ['true', '1', 'yes'].includes(value.toLowerCase());
};

/**
 * Get an integer environment variable
 * @param {string} key - The environment variable name
 * @param {number} defaultValue - Default value if not found
 * @returns {number} The parsed integer value
 */
const getIntEnvVar = (key, defaultValue) => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Check if we're in development environment
 * @returns {boolean} True if in development
 */
const isDevelopment = () => config.isDevelopment;

/**
 * Check if we're in production environment
 * @returns {boolean} True if in production
 */
const isProduction = () => config.isProduction;

/**
 * Check if we're in test environment
 * @returns {boolean} True if in test
 */
const isTest = () => config.isTest;

module.exports = {
  getEnvVar,
  checkRequiredVars,
  getBoolEnvVar,
  getIntEnvVar,
  isDevelopment,
  isProduction,
  isTest
}; 