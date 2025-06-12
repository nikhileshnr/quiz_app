const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Determine environment
const environment = process.env.NODE_ENV || 'development';

// Try to load .env file, but don't fail if not found
try {
  // First try in the backend directory
  const envPath = path.resolve(process.cwd(), '.env');
  // Also check parent directory in case .env is still at the root
  const parentEnvPath = path.resolve(process.cwd(), '..', '.env');
  
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      console.warn(`Error loading .env file: ${result.error.message}`);
    } else {
      console.log('Environment variables loaded from .env file');
    }
  } else if (fs.existsSync(parentEnvPath)) {
    const result = dotenv.config({ path: parentEnvPath });
    if (result.error) {
      console.warn(`Error loading .env file from parent directory: ${result.error.message}`);
    } else {
      console.log('Environment variables loaded from parent directory .env file');
    }
  } else {
    console.warn('No .env file found. Using default values or system environment variables.');
    
    // Set default values if .env doesn't exist
    process.env.PORT = process.env.PORT || 5000;
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quiz_app';
  }
} catch (error) {
  console.error(`Error in environment setup: ${error.message}`);
}

// Configuration object
const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || 5000, 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // Database Configuration
  db: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/quiz_app',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // API Keys
  api: {
    gemini: process.env.GEMINI_API_KEY || ''
  },
  
  // Check if required environment variables are set
  validate() {
    const requiredEnvs = [
      // Add required environment variables here
      // Example: 'MONGO_URI'
    ];
    
    // Only in production, we might want to enforce certain environment variables
    if (this.isProduction) {
      requiredEnvs.push('GEMINI_API_KEY');
    }
    
    const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
    
    if (missingEnvs.length > 0) {
      console.warn(`Missing required environment variables: ${missingEnvs.join(', ')}`);
      return false;
    }
    
    return true;
  }
};

// Validate the configuration
const isValid = config.validate();
if (!isValid && config.isProduction) {
  console.error('Invalid configuration. Check your environment variables.');
  process.exit(1);
}

module.exports = config; 