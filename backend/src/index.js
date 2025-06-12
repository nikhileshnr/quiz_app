const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const connectDB = require('./config/database');

// Import middleware
const { logger, errorLogger } = require('./middleware/logger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Import routes
const quizRoutes = require('./routes/quizRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Setup logging based on environment
app.use(logger());

// Routes
app.use('/api/quiz', quizRoutes);

// Default route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to AI Quiz API',
    status: 'Server is running',
    environment: config.nodeEnv
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB (mock for now)
    const dbConnection = await connectDB();
    
    // Start server
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
      if (dbConnection.isMock) {
        console.log('Using mock database connection');
      }
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app; 