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
  
  console.log('[DEBUG] API Key valid, initializing Gemini client');
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
    console.log('[DEBUG] Starting quiz generation with parameters:', { topic, difficulty, level, questionCount });
    
    // Initialize the Gemini client
    console.log('[DEBUG] About to initialize Gemini client...');
    const genAI = initGeminiClient();
    console.log('[DEBUG] Client initialized successfully');
    
    // IMPORTANT: Only use gemini-2.0-flash which is the only working model
    console.log('[DEBUG] Creating model instance with gemini-2.0-flash (confirmed working)');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.95,
      }
    });
    
    // Try a simple test first
    console.log('[DEBUG] Testing Gemini API with simple request...');
    try {
      console.log('[DEBUG] About to send test request to Gemini...');
      const testPromise = model.generateContent("What is 2+2? Answer in one word only.");
      console.log('[DEBUG] Waiting for test response...');
      const testResult = await testPromise;
      console.log('[DEBUG] Test response received!');
      const testResponse = testResult.response.text();
      console.log('[DEBUG] Test response text:', testResponse);
    } catch (testError) {
      console.error('[DEBUG] Test request failed with error:', testError);
      throw new Error(`Gemini API test failed: ${testError.message}`);
    }
    
    // Generate quiz content
    console.log('[DEBUG] Creating quiz prompt...');
    const prompt = createQuizPrompt({ topic, difficulty, level, questionCount });
    
    console.log('[DEBUG] About to send quiz request to Gemini API...');
    try {
      console.log('[DEBUG] Sending quiz generation request NOW...');
      const result = await model.generateContent(prompt);
      
      console.log('[DEBUG] Quiz response received successfully!');
      const response = await result.response;
      const text = response.text();
      
      console.log('[DEBUG] First 100 chars of response:', text.substring(0, 100) + '...');
      
      // Parse the response into a structured quiz
      console.log('[DEBUG] About to parse quiz response...');
      const quiz = parseQuizResponse(text, { topic, difficulty, level });
      
      console.log('[DEBUG] Successfully parsed quiz');
      return quiz;
    } catch (apiError) {
      console.error('[DEBUG] Quiz generation request failed with error:', apiError);
      throw new Error(`Gemini API Error: ${apiError.message}`);
    }
  } catch (error) {
    console.error('[DEBUG] Error in generateQuiz function:', error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
};

/**
 * Create a simple prompt for generating a small quiz
 */
const createSimpleQuizPrompt = ({ topic, difficulty, level }) => {
  return `
    Create a very short quiz about "${topic}" with just 1 question.
    
    The quiz should be structured precisely as follows:
    
    {
      "title": "Quiz on ${topic}",
      "questions": [
        {
          "text": "Question text goes here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswers": ["Option A"], 
          "type": "single"
        }
      ]
    }
    
    IMPORTANT: Make sure the response is valid JSON that can be parsed by JavaScript.
  `;
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
    3. 30% of questions should be multiple-choice (1-4 correct answers).
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
    4. Multiple-choice questions have 1-4 correct answers.
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
      console.error('Could not extract JSON. Full response:', responseText);
      throw new Error('Could not extract JSON from the response');
    }
    
    const jsonString = jsonMatch[0];
    console.log('Extracted JSON string:', jsonString.substring(0, 100) + '...');
    
    try {
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
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error(`Failed to parse JSON: ${parseError.message}`);
    }
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
    
    // Make sure all correct answers are valid options
    question.correctAnswers.forEach(answer => {
      if (!question.options.includes(answer)) {
        throw new Error(`Question ${index + 1} has a correct answer "${answer}" that is not in the options`);
      }
    });
  });
};

/**
 * Verify a question using Gemini API
 * @param {Object} params - Verification parameters
 * @param {Object} params.question - The question to verify
 * @param {Object} params.originalQuestion - The original question (optional)
 * @param {Object} params.quizParams - The quiz parameters (topic, difficulty, level)
 * @returns {Promise<Object>} Verification result
 */
const verifyQuestion = async ({ question, originalQuestion, quizParams }) => {
  try {
    console.log('Verifying question with Gemini...');
    
    // Initialize the Gemini client
    const genAI = initGeminiClient();
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.2,
        topP: 0.95,
      }
    });
    
    // Create a prompt for verification
    let prompt;
    
    if (originalQuestion) {
      // If we have both an original and edited question
      prompt = `
        You are an expert quiz validator. Review the following quiz question 
        for a quiz on the topic: "${quizParams.title || quizParams.topic}" with difficulty: ${quizParams.difficulty}.
        
        ORIGINAL QUESTION:
        ${JSON.stringify(originalQuestion, null, 2)}
        
        EDITED QUESTION:
        ${JSON.stringify(question, null, 2)}
        
        Your task is to determine if the edited question is valid and correct.
      `;
    } else {
      // If we only have one question to verify
      prompt = `
        You are an expert quiz validator. Review the following quiz question 
        for a quiz on the topic: "${quizParams.title || quizParams.topic}" with difficulty: ${quizParams.difficulty}.
        
        QUESTION TO VERIFY:
        ${JSON.stringify(question, null, 2)}
        
        Your task is to determine if this question is valid, factually accurate, and has correctly marked answer(s).
      `;
    }
    
    prompt += `
      Guidelines for validation:
      1. The question must be factually accurate
      2. The correct answer(s) must actually be correct for the question
      3. For multiple-choice questions, all correct answers should be marked
      4. Distractors (incorrect options) should be plausible but clearly incorrect
      5. The question should be at an appropriate ${quizParams.level} education level
      6. The question should be at an appropriate ${quizParams.difficulty} difficulty level
      
      Respond with a JSON object in exactly this format:
      {
        "isCorrect": true/false,
        "feedback": "Your detailed feedback about the quality of the question",
        "suggestions": ["Suggestion 1", "Suggestion 2"]
      }
    `;
    
    console.log('Sending verification request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from the response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from verification response');
      }
      
      const verificationResult = JSON.parse(jsonMatch[0]);
      
      // Ensure the response has the expected format
      if (verificationResult.isValid !== undefined && verificationResult.isCorrect === undefined) {
        verificationResult.isCorrect = verificationResult.isValid;
        delete verificationResult.isValid;
      }
      
      if (!verificationResult.feedback && verificationResult.explanation) {
        verificationResult.feedback = verificationResult.explanation;
        delete verificationResult.explanation;
      }
      
      if (!verificationResult.suggestions) {
        verificationResult.suggestions = [];
      }
      
      return verificationResult;
    } catch (parseError) {
      console.error('Failed to parse verification response:', parseError);
      return {
        isCorrect: false,
        feedback: 'Failed to validate the question due to a technical issue. Try again or proceed with your own judgment.',
        suggestions: ['Try again with a simpler question structure.']
      };
    }
  } catch (error) {
    console.error('Error in verifyQuestion:', error);
    throw error;
  }
};

/**
 * Regenerate specific questions in a quiz
 * @param {Object} params - Regeneration parameters
 * @param {string} params.topic - Topic to generate questions about
 * @param {string} params.difficulty - Difficulty level
 * @param {string} params.level - Academic level
 * @param {Array<number>} params.indicesToRegenerate - Indices of questions to regenerate
 * @param {Array<Object>} params.currentQuestions - Current quiz questions
 * @returns {Promise<Array<Object>>} Regenerated questions
 */
const regenerateQuestions = async ({ 
  topic, 
  difficulty, 
  level, 
  indicesToRegenerate, 
  currentQuestions 
}) => {
  try {
    console.log('Regenerating questions with indices:', indicesToRegenerate);
    
    // Initialize the Gemini client
    const genAI = initGeminiClient();
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.95,
      }
    });
    
    // Get the types of questions to regenerate (single or multiple)
    const questionsToRegenerate = indicesToRegenerate.map(index => {
      if (index >= 0 && index < currentQuestions.length) {
        return {
          index,
          type: currentQuestions[index].type
        };
      }
      return null;
    }).filter(q => q !== null);
    
    // Create a prompt for regeneration
    const prompt = `
      Generate ${questionsToRegenerate.length} quiz questions about "${topic}".
      
      Difficulty level: ${difficulty} (easy, medium, or hard)
      Academic level: ${level} (school, undergraduate, or postgraduate)
      
      Specific requirements for the questions:
      ${questionsToRegenerate.map((q, i) => 
        `Question ${i+1}: ${q.type === 'single' ? 'Single choice (1 correct answer)' : 'Multiple choice (2-3 correct answers)'}`
      ).join('\n')}
      
      The questions must be structured precisely as follows:
      
      [
        {
          "text": "Question text goes here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswers": ["Option A"], 
          "type": "single"
        }
      ]
      
      IMPORTANT: 
      1. Each question must have exactly 4 options
      2. The response must be a valid JSON array that can be parsed by JavaScript
      3. Make sure the "correctAnswers" field contains the exact text of the correct options
      4. All questions must be factually accurate and appropriate for the topic
    `;
    
    console.log('Sending regeneration request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from the response
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON array from regeneration response');
      }
      
      const regeneratedQuestions = JSON.parse(jsonMatch[0]);
      
      // Validate the regenerated questions
      for (const question of regeneratedQuestions) {
        if (!question.text || !question.options || !question.correctAnswers || !question.type) {
          throw new Error('Regenerated question is missing required fields');
        }
        
        if (!Array.isArray(question.options) || question.options.length !== 4) {
          throw new Error('Regenerated question must have exactly 4 options');
        }
        
        if (question.type === 'single' && question.correctAnswers.length !== 1) {
          throw new Error('Single-choice question must have exactly 1 correct answer');
        }
        
        // No validation for minimum number of correct answers for multiple-choice questions
        // Multiple-choice questions can have 1-4 correct answers
      }
      
      return regeneratedQuestions;
    } catch (parseError) {
      console.error('Failed to parse regeneration response:', parseError);
      throw new Error('Failed to generate new questions. Please try again.');
    }
  } catch (error) {
    console.error('Error in regenerateQuestions:', error);
    throw error;
  }
};

module.exports = {
  generateQuiz,
  verifyQuestion,
  regenerateQuestions,
  // Export for testing
  parseQuizResponse
}; 