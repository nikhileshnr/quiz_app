/**
 * Test Runner for AI Quiz API
 * Runs all tests and reports results
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '.env');
const parentEnvPath = path.resolve(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('Loaded .env from backend directory');
} else if (fs.existsSync(parentEnvPath)) {
  require('dotenv').config({ path: parentEnvPath });
  console.log('Loaded .env from parent directory');
} else {
  console.log('No .env file found for tests');
}

// Define test files
const tests = [
  'src/tests/manualQuiz.test.js',
  'src/tests/aiQuiz.test.js',
  'src/tests/geminiMock.test.js'
];

// Add integration test if API key is available
if (process.env.GEMINI_API_KEY) {
  tests.push('src/tests/geminiIntegration.test.js');
}

// Results tracking
const results = {
  total: tests.length,
  passed: 0,
  failed: 0,
  skipped: 0,
  details: []
};

/**
 * Run a single test file
 */
function runTest(testFile) {
  return new Promise((resolve) => {
    console.log(`\n\n---- Running ${path.basename(testFile)} ----`);
    const testProcess = exec(`node ${testFile}`, { maxBuffer: 1024 * 1024 });
    
    let output = '';
    
    testProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
      output += data;
    });
    
    testProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
      output += data;
    });
    
    testProcess.on('exit', (code) => {
      const status = code === 0 ? 'PASSED' : 'FAILED';
      results.details.push({
        file: path.basename(testFile),
        status,
        output
      });
      
      if (status === 'PASSED') {
        results.passed++;
      } else {
        results.failed++;
      }
      
      resolve();
    });
  });
}

/**
 * Run all tests sequentially
 */
async function runAllTests() {
  console.log('=================================');
  console.log('🧪 STARTING AI QUIZ API TEST SUITE');
  console.log('=================================');
  
  const startTime = Date.now();
  
  // Check if API key is missing and inform about the integration test
  if (!process.env.GEMINI_API_KEY) {
    console.log('ℹ️  No GEMINI_API_KEY found in environment variables.');
    console.log('ℹ️  The Gemini integration test will be skipped.');
    console.log('ℹ️  To run the full test suite, add GEMINI_API_KEY to your .env file.');
    results.skipped++;
  }
  
  // Run each test file sequentially
  for (const testFile of tests) {
    await runTest(testFile);
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Print summary
  console.log('\n\n=================================');
  console.log('🏁 TEST RESULTS SUMMARY');
  console.log('=================================');
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏩ Skipped: ${results.skipped}`);
  console.log(`⏱️  Duration: ${duration}s`);
  
  // Print failures if any
  const failures = results.details.filter(r => r.status === 'FAILED');
  if (failures.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failures.forEach(failure => {
      console.log(`- ${failure.file}`);
    });
  }
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the tests
runAllTests(); 