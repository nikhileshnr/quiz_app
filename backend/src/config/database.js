const mongoose = require('mongoose');
const config = require('./env');

/**
 * Connect to MongoDB database
 * @returns {Promise<mongoose.Connection>} Mongoose connection object
 */
const connectDB = async () => {
  try {
    // If we're in test mode and a test database URI is not explicitly provided,
    // modify the URI to use a test database to avoid affecting the main database
    let uri = config.db.uri;
    if (config.isTest && !uri.includes('_test')) {
      uri = uri.replace(/\/([^/]+)$/, '/$1_test');
    }
    
    // If we're in development mode with no .env file, we'll mock the connection
    if (!uri && config.isDevelopment) {
      console.log('No MongoDB URI provided. Using mock connection for development.');
      return {
        connection: {
          host: 'mock-localhost',
          port: 27017,
          name: 'mock-quiz_app'
        },
        isMock: true
      };
    }
    
    // Connect to MongoDB
    console.log(`Connecting to MongoDB at ${uri.split('@').pop()}...`); // Don't log credentials
    
    const conn = await mongoose.connect(uri, config.db.options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    // In development mode, we can continue with a mock connection
    if (config.isDevelopment) {
      console.warn('Continuing in development mode with mock database.');
      return {
        connection: {
          host: 'mock-localhost',
          port: 27017,
          name: 'mock-quiz_app'
        },
        isMock: true
      };
    }
    
    // In production or test, fail fast
    process.exit(1);
  }
};

module.exports = connectDB; 