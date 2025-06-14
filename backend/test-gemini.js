const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiAPI() {
  console.log('Testing Gemini API connection...');
  
  // Check if API key is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not set in environment variables.');
    process.exit(1);
  }
  
  // Log partial API key for verification
  const keyLength = apiKey.length;
  const firstChars = apiKey.substring(0, 4);
  const lastChars = apiKey.substring(keyLength - 4);
  console.log(`Using API Key: ${firstChars}...${lastChars} (${keyLength} characters)`);
  
  try {
    // Initialize the Gemini client
    console.log('Initializing Gemini client...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Send a simple test prompt
    console.log('Sending test request to Gemini API...');
    const result = await model.generateContent("Say 'Hello, I am working!' if you can see this message.");
    const response = await result.response;
    const text = response.text();
    
    console.log('\nGemini API Response:');
    console.log('-------------------');
    console.log(text);
    console.log('-------------------');
    console.log('\nSuccess! The Gemini API key is working correctly.');
    
  } catch (error) {
    console.error('\nError testing Gemini API:');
    console.error(error);
    
    if (error.message.includes('API key')) {
      console.error('\nIt appears there is an issue with the API key. Please check that:');
      console.error('1. The key is valid and active');
      console.error('2. The key has proper permissions for the Gemini API');
      console.error('3. There are no billing issues with your Google Cloud account');
    } else if (error.message.includes('network')) {
      console.error('\nThere appears to be a network issue. Please check your internet connection.');
    }
  }
}

// Run the test
testGeminiAPI(); 