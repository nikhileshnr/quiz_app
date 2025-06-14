// Test file for Gemini API
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get API key from environment variable
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

console.log(`GEMINI_API_KEY is set (${apiKey.length} chars, starts with ${apiKey.substring(0, 4)}... ends with ...${apiKey.substring(apiKey.length - 4)})`);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey);

// Simple test prompt
const prompt = `Create a simple quiz with 2 questions about JavaScript.
Response should be in this JSON format:
{
  "title": "JavaScript Quiz",
  "questions": [
    {
      "text": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswers": ["Option A"],
      "type": "single"
    }
  ]
}`;

async function testGeminiAPI() {
  console.log('Starting Gemini API test...');
  
  try {
    // Try a simpler model
    console.log('Testing with gemini-pro model...');
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      console.log('Model instance created');
      
      console.log('Sending request...');
      const result = await model.generateContent("What is 2+2? Answer with just the number.");
      console.log('Response received!');
      
      const text = result.response.text();
      console.log('Simple test response:', text);
    } catch (e) {
      console.error('Error with simple test:', e.message);
    }
    
    // Try all these models
    const modelsToTry = [
      'gemini-pro',
      'gemini-pro-vision',
      'embedding-001',
      'embedding-latest',
      'text-embedding-004',
      'text-unicorn-001',
      'gemini-2.0-flash'
    ];
    
    console.log('\nTrying different models:');
    for (const modelName of modelsToTry) {
      try {
        console.log(`\nTesting model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        console.log('Sending simple request...');
        const result = await model.generateContent("What is 2+2?");
        console.log('Response received!');
        
        const text = result.response.text();
        console.log(`Response from ${modelName}:`, text);
        console.log('✓ Success with', modelName);
      } catch (error) {
        console.error(`✗ Error with ${modelName}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('General error:', error);
  }
}

testGeminiAPI()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err)); 