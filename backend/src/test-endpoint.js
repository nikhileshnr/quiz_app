// Simple script to test the Gemini API endpoint
const axios = require('axios');

async function testGeminiEndpoint() {
  console.log('Testing Gemini API endpoint...');
  
  try {
    // Set timeout
    const timeout = 30000; // 30 seconds
    
    console.log('Sending request to test endpoint...');
    const response = await axios.post('http://localhost:5000/api/quiz/test-gemini', {}, {
      timeout: timeout
    });
    
    console.log('Response status:', response.status);
    console.log('Response from endpoint:', response.data);
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out after 30 seconds');
    } else if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Error status:', error.response.status);
      console.error('Error details:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
  }
}

console.log('Starting test...');
testGeminiEndpoint()
  .then(() => console.log('Test complete'))
  .catch(err => console.error('Test failed:', err)); 