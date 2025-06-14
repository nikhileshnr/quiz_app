const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const connectDB = require('./config/database');

// Debug server startup
console.log('[STARTUP] Debug: Starting server initialization');

// Import middleware
console.log('[STARTUP] Debug: Importing middleware');
const { logger, errorLogger } = require('./middleware/logger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Import routes
console.log('[STARTUP] Debug: Importing routes');
const quizRoutes = require('./routes/quizRoutes');
const authRoutes = require('./routes/authRoutes');
const invitationRoutes = require('./routes/invitationRoutes');

// Initialize express app
console.log('[STARTUP] Debug: Initializing Express app');
const app = express();

// Middleware
console.log('[STARTUP] Debug: Setting up middleware');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(logger());

// API Routes
console.log('[STARTUP] Debug: Setting up API routes');
app.use('/api/quiz', quizRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/invitation', invitationRoutes);

// Serve static assets in production
if (config.isProduction) {
  console.log('[STARTUP] Debug: Setting up production static assets');
  // Set static folder
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  // Serve the frontend for any routes not handled by the API
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/dist/index.html'));
  });
}

// Health check route
console.log('[STARTUP] Debug: Setting up health check route');
app.get('/api/health', (req, res) => {
  console.log('[API] Health check requested');
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// Error handlers
console.log('[STARTUP] Debug: Setting up error handlers');
app.use(errorLogger);
app.use(notFoundHandler);
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  console.log('[STARTUP] Debug: Starting server setup');
  try {
    // Connect to MongoDB
    console.log('[STARTUP] Debug: Connecting to MongoDB');
    await connectDB();
    
    // Start server
    const PORT = config.port;
    console.log('[STARTUP] Debug: Starting HTTP server on port', PORT);
    app.listen(PORT, () => {
      console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`[ERROR] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
console.log('[STARTUP] Debug: Calling startServer function');
startServer();

module.exports = app; 