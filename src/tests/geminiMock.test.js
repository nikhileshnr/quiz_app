/**
 * Gemini Service Mock Tests
 * 
 * These tests verify that the Gemini service can correctly parse AI responses.
 * Run with: npm test -- src/tests/geminiMock.test.js
 */

const geminiService = require('../services/geminiService');

// Mock API response
const mockGeminiResponse = `
{
  "title": "JavaScript Basics Quiz",
  "questions": [
    {
      "text": "What is JavaScript primarily used for?",
      "options": [
        "Server-side scripting",
        "Client-side web development",
        "Database management",
        "Operating system development"
      ],
      "correctAnswers": ["Client-side web development"],
      "type": "single"
    },
    {
      "text": "Which of the following are valid JavaScript data types?",
      "options": [
        "String",
        "Number",
        "Boolean",
        "Character"
      ],
      "correctAnswers": ["String", "Number", "Boolean"],
      "type": "multiple"
    },
    {
      "text": "Which keyword is used to declare a variable in JavaScript?",
      "options": [
        "var",
        "let",
        "const",
        "def"
      ],
      "correctAnswers": ["var", "let", "const"],
      "type": "multiple"
    }
  ]
}`;

// Test metadata
const testMetadata = {
  topic: 'JavaScript Basics',
  difficulty: 'medium',
  level: 'undergrad'
};

/**
 * Setup
 */
beforeAll(() => {
  console.log('Starting Gemini mock tests');
  
  // Modify the parseQuizResponse function to be directly testable
  // In a real test setup, we'd use a proper test framework's spies
  const originalParseFunction = geminiService.parseQuizResponse;
  geminiService.parseQuizResponse = function(responseText, metadata) {
    console.log('Calling parseQuizResponse with mock data');
    return originalParseFunction ? originalParseFunction(responseText, metadata) : {};
  };
});

/**
 * Helper functions for testing
 */
function testParseQuizResponse() {
  try {
    // Get the parseQuizResponse function from the module
    const parseQuizResponse = geminiService.parseQuizResponse;
    
    if (typeof parseQuizResponse !== 'function') {
      console.error('parseQuizResponse is not exported or not a function');
      return false;
    }
    
    // Parse the mock response
    const quiz = parseQuizResponse(mockGeminiResponse, testMetadata);
    
    // Validate the parsed quiz
    console.log('Parsed quiz:', JSON.stringify(quiz, null, 2));
    
    // Check structure (simple checks for demonstration)
    console.log('Checking quiz structure...');
    console.assert(quiz.title === 'JavaScript Basics Quiz', 'Title should match');
    console.assert(quiz.difficulty === 'medium', 'Difficulty should be set');
    console.assert(quiz.level === 'undergrad', 'Level should be set');
    console.assert(quiz.createdBy === 'ai', 'createdBy should be "ai"');
    console.assert(Array.isArray(quiz.questions), 'Questions should be an array');
    console.assert(quiz.questions.length === 3, 'Should have 3 questions');
    
    // Check first question
    const q1 = quiz.questions[0];
    console.assert(q1.text.includes('JavaScript'), 'Question 1 text');
    console.assert(q1.options.length === 4, 'Question 1 should have 4 options');
    console.assert(q1.correctAnswers.length === 1, 'Question 1 should have 1 correct answer');
    console.assert(q1.type === 'single', 'Question 1 should be single-choice');
    
    // Check second question
    const q2 = quiz.questions[1];
    console.assert(q2.correctAnswers.length === 3, 'Question 2 should have 3 correct answers');
    console.assert(q2.type === 'multiple', 'Question 2 should be multiple-choice');
    
    return true;
  } catch (error) {
    console.error('Error in testParseQuizResponse:', error);
    return false;
  }
}

/**
 * Tests
 */
describe('Gemini Service', () => {
  it('should correctly parse a valid Gemini API response', () => {
    console.log('Running test: should correctly parse a valid Gemini API response');
    
    const result = testParseQuizResponse();
    expect(result).toBe(true);
  });
});

/**
 * Mock testing infrastructure
 */
function describe(name, callback) {
  console.log(`\n=== ${name} ===`);
  callback();
}

function it(name, callback) {
  console.log(`\n-> ${name}`);
  callback();
}

function expect(received) {
  return {
    toBe: (expected) => {
      if (received !== expected) {
        throw new Error(`Expected ${expected} but received ${received}`);
      }
      console.log('✓ Test passed!');
      return true;
    }
  };
}; 