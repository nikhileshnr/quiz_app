// Create the most basic express server
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  console.log('Received request to /', new Date().toISOString());
  res.json({ status: 'ok', message: 'Simple test server is working' });
});

// Health endpoint
app.get('/health', (req, res) => {
  console.log('Received request to /health', new Date().toISOString());
  res.json({ status: 'ok', message: 'Health check passed' });
});

// Start server
const PORT = 5001; // Use a different port than the main app
app.listen(PORT, () => {
  console.log(`Simple test server running on port ${PORT}`);
}); 