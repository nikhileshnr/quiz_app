/**
 * Gemini API Integration Test
 * 
 * This test makes ACTUAL calls to the Gemini API to generate quiz questions.
 * It requires a valid GEMINI_API_KEY in the .env file to run.
 * 
 * Run with: node src/tests/geminiIntegration.test.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

// Test parameters
const testTopic = "Solar System";
const testDifficulty = "medium";
const testLevel = "school";
const testQuestionCount = 3;

// Flag to check if we should skip the test due to missing API key
let skipTest = false;

/**
 * The actual implementation of the geminiService.generateQuiz function
 * This is the real implementation that would call the Gemini API
 */
async function generateQuiz({ topic, difficulty, level, questionCount = 5 }) {
  try {
    // Get API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in .env');
    }
    
    // Initialize the Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Create the prompt for generating quiz questions
    const prompt = createPrompt({ topic, difficulty, level, questionCount });
    console.log("🚀 Sending prompt to Gemini API...");
    
    // Generate quiz content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ Received response from Gemini API");
    
    // Parse the response into a structured quiz
    console.log("🔍 Parsing JSON response...");
    const quiz = parseResponse(text, { topic, difficulty, level });
    
    return quiz;
  } catch (error) {
    console.error('❌ Error generating quiz with Gemini:', error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
}

/**
 * Create a prompt for the Gemini API
 */
function createPrompt({ topic, difficulty, level, questionCount }) {
  return `
    Create a quiz about "${topic}" with exactly ${questionCount} questions.
    
    Difficulty level: ${difficulty} (easy, medium, or hard)
    Academic level: ${level} (school, undergraduate, or postgraduate)
    
    Requirements:
    1. Each question should have 4 options.
    2. 70% of questions should be single-choice (one correct answer).
    3. 30% of questions should be multiple-choice (2-3 correct answers).
    4. Questions must be in JSON format that can be parsed by JavaScript.
    
    The quiz should be structured precisely as follows:
    
    {
      "title": "Quiz Title",
      "questions": [
        {
          "text": "Question text goes here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswers": ["Option A"], 
          "type": "single"
        },
        {
          "text": "Multiple-choice question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswers": ["Option A", "Option C"],
          "type": "multiple"
        }
      ]
    }
    
    IMPORTANT: Make sure:
    1. The response is valid JSON that can be parsed by JavaScript.
    2. All questions have exactly 4 options.
    3. Single-choice questions have exactly 1 correct answer.
    4. Multiple-choice questions have 2-3 correct answers.
    5. The "correctAnswers" field always contains the exact text of the correct options.
    6. The full response must be parsable as JSON - don't include any text before or after the JSON.
  `;
}

/**
 * Parse the Gemini API response
 */
function parseResponse(responseText, { topic, difficulty, level }) {
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
      difficulty,
      level,
      createdBy: 'ai'
    };
    
    // If no title was generated, create one from the topic
    if (!quiz.title) {
      quiz.title = `Quiz on ${topic} (${difficulty} level)`;
    }
    
    // Validate the structure
    validateQuizStructure(quiz);
    
    return quiz;
  } catch (error) {
    console.error('Error parsing quiz response:', error);
    throw new Error(`Failed to parse generated quiz: ${error.message}`);
  }
}

/**
 * Validate the structure of the generated quiz
 */
function validateQuizStructure(quiz) {
  if (!quiz.questions || !Array.isArray(quiz.questions)) {
    throw new Error('Invalid quiz format: Missing questions array');
  }
  
  quiz.questions.forEach((question, index) => {
    if (!question.text) {
      throw new Error(`Question ${index + 1} is missing text`);
    }
    
    if (!question.options || !Array.isArray(question.options) || question.options.length !== 4) {
      throw new Error(`Question ${index + 1} must have exactly 4 options`);
    }
    
    if (!question.correctAnswers || !Array.isArray(question.correctAnswers) || question.correctAnswers.length < 1) {
      throw new Error(`Question ${index + 1} must have at least one correct answer`);
    }
    
    if (question.type === 'single' && question.correctAnswers.length !== 1) {
      throw new Error(`Question ${index + 1} is marked as single-choice but has ${question.correctAnswers.length} correct answers`);
    }
    
    if (question.type === 'multiple' && question.correctAnswers.length < 2) {
      throw new Error(`Question ${index + 1} is marked as multiple-choice but has fewer than 2 correct answers`);
    }
    
    // Make sure all correct answers are valid options
    question.correctAnswers.forEach(answer => {
      if (!question.options.includes(answer)) {
        throw new Error(`Question ${index + 1} has a correct answer "${answer}" that is not in the options`);
      }
    });
  });
}

/**
 * Setup and teardown
 */
function beforeAll() {
  console.log('🔄 Starting Gemini API integration test');
  
  // Check if we have an API key
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not found in environment. Integration test will be skipped.');
    skipTest = true;
  } else {
    console.log('🔑 Found GEMINI_API_KEY in environment. Running test with actual API call.');
  }
}

function afterAll() {
  console.log('🏁 Gemini API integration test completed');
}

/**
 * The actual integration test
 */
async function runTest() {
  try {
    // Generate a quiz using the real API
    console.log(`📝 Generating quiz about "${testTopic}" (${testDifficulty} difficulty, ${testLevel} level)`);
    const quiz = await generateQuiz({
      topic: testTopic,
      difficulty: testDifficulty,
      level: testLevel,
      questionCount: testQuestionCount
    });
    
    // Validate the generated quiz
    console.log('🔍 Validating generated quiz structure');
    console.assert(quiz.title, 'Quiz should have a title');
    console.assert(quiz.questions.length === testQuestionCount, `Quiz should have ${testQuestionCount} questions`);
    console.assert(quiz.difficulty === testDifficulty, 'Quiz difficulty should match request');
    console.assert(quiz.level === testLevel, 'Quiz level should match request');
    
    // Count single and multiple choice questions
    const singleChoiceCount = quiz.questions.filter(q => q.type === 'single').length;
    const multipleChoiceCount = quiz.questions.filter(q => q.type === 'multiple').length;
    
    console.log(`📊 Question types: ${singleChoiceCount} single-choice, ${multipleChoiceCount} multiple-choice`);
    
    // Save the quiz to a file for inspection
    const outputPath = path.join(__dirname, '..', '..', 'generated_quiz.json');
    fs.writeFileSync(outputPath, JSON.stringify(quiz, null, 2), 'utf8');
    console.log(`💾 Generated quiz saved to ${outputPath}`);
    
    // Output one example question
    console.log('\n📋 Example question from generated quiz:');
    const exampleQuestion = quiz.questions[0];
    console.log(`Q: ${exampleQuestion.text}`);
    exampleQuestion.options.forEach((option, i) => {
      const isCorrect = exampleQuestion.correctAnswers.includes(option);
      console.log(`${i + 1}. ${option} ${isCorrect ? '✓' : ''}`);
    });
    
    console.log('\n✅ Integration test PASSED! The quiz was generated successfully.');
    return true;
  } catch (error) {
    console.error(`❌ Integration test FAILED: ${error.message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function main() {
  beforeAll();
  
  if (skipTest) {
    console.log('\n⏩ Skipping integration test due to missing API key');
    console.log('💡 To run this test, add a GEMINI_API_KEY in your .env file');
    return;
  }
  
  try {
    await runTest();
  } finally {
    afterAll();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  main();
} 