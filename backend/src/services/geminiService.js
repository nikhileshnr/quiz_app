const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

/**
 * Initialize Gemini API client
 * @returns {GoogleGenerativeAI} Gemini client instance
 */
const initGeminiClient = () => {
  // Check if API key is available
  const apiKey = config.api.gemini;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in .env');
  }
  
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Generate quiz questions using Gemini API
 * @param {Object} params - Generation parameters
 * @param {string} params.topic - Topic to generate questions about
 * @param {string} params.difficulty - Difficulty level (easy, medium, hard)
 * @param {string} params.level - Academic level (school, undergrad, postgrad)
 * @param {number} params.questionCount - Number of questions to generate
 * @returns {Promise<Object>} The generated quiz
 */
const generateQuiz = async ({ topic, difficulty, level, questionCount = 5 }) => {
  try {
    // Initialize the Gemini client
    const genAI = initGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Create the prompt for generating quiz questions
    const prompt = createQuizPrompt({ topic, difficulty, level, questionCount });
    
    // Generate quiz content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response into a structured quiz
    const quiz = parseQuizResponse(text, { topic, difficulty, level });
    
    return quiz;
  } catch (error) {
    console.error('Error generating quiz with Gemini:', error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
};

/**
 * Create a prompt for generating a quiz with the given parameters
 * @param {Object} params - Quiz parameters
 * @returns {string} The formatted prompt
 */
const createQuizPrompt = ({ topic, difficulty, level, questionCount }) => {
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
};

/**
 * Parse the Gemini API response into a structured quiz
 * @param {string} responseText - Raw response from the API
 * @param {Object} metadata - Additional metadata for the quiz
 * @returns {Object} Parsed quiz object
 */
const parseQuizResponse = (responseText, { topic, difficulty, level }) => {
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
};

/**
 * Validate the structure of the generated quiz
 * @param {Object} quiz - The quiz to validate
 * @throws {Error} If the quiz structure is invalid
 */
const validateQuizStructure = (quiz) => {
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
};

module.exports = {
  generateQuiz,
  // Export for testing
  parseQuizResponse
}; 