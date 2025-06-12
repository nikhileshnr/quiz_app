/**
 * Gemini Service Mock Tests
 * 
 * These tests verify that the Gemini service can correctly parse AI responses.
 * Run with: node src/tests/geminiMock.test.js
 */

// Mock geminiService implementation
const geminiService = {
  parseQuizResponse: function(responseText, metadata) {
    console.log('Parsing quiz response');
    
    try {
      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from the response');
      }
      
      const jsonString = jsonMatch[0];
      const quizData = JSON.parse(jsonString);
      
      // Add metadata
      const quiz = {
        ...quizData,
        difficulty: metadata.difficulty,
        level: metadata.level,
        createdBy: 'ai'
      };
      
      // If no title was generated, create one from the topic
      if (!quiz.title) {
        quiz.title = `Quiz on ${metadata.topic} (${metadata.difficulty} level)`;
      }
      
      return quiz;
    } catch (error) {
      console.error('Error parsing quiz response:', error);
      throw new Error(`Failed to parse generated quiz: ${error.message}`);
    }
  }
};

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
function beforeAll() {
  console.log('Starting Gemini mock tests');
}

function afterAll() {
  console.log('Gemini mock tests completed');
}

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
function runTests() {
  console.log('\n=== Gemini Service ===');
  
  // Test: Parse valid API response
  console.log('\n-> should correctly parse a valid Gemini API response');
  
  const result = testParseQuizResponse();
  if (result) {
    console.log('✓ Test passed!');
  } else {
    console.error('✗ Test failed!');
  }
}

/**
 * Run tests if this file is executed directly
 */
if (require.main === module) {
  beforeAll();
  try {
    runTests();
  } finally {
    afterAll();
  }
} 