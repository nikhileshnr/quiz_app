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
    
    // Connect to MongoDB
    console.log(`Connecting to MongoDB at ${uri.split('@').pop()}...`); // Don't log credentials
    
    if (!uri) {
      throw new Error('MongoDB URI is required. Please set MONGO_URI in .env file');
    }
    
    const conn = await mongoose.connect(uri, config.db.options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 