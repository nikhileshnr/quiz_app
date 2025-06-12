// Import the Quiz model
const Quiz = require('../models/quizModel');
const geminiService = require('../services/geminiService');

/**
 * Get all quizzes with pagination
 * @route GET /api/quiz
 */
exports.getAllQuizzes = async (req, res, next) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Build query filters based on request parameters
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // Process filters like difficulty, level, etc.
    let query = Quiz.find(queryObj);
    
    // Sort options
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Default sort by creation date
    }
    
    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Pagination
    query = query.skip(skip).limit(limit);
    
    // Execute query
    const quizzes = await query;
    const total = await Quiz.countDocuments(queryObj);
    
    // Send response
    res.status(200).json({
      status: 'success',
      results: quizzes.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single quiz by ID
 * @route GET /api/quiz/:id
 */
exports.getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      const error = new Error('Quiz not found');
      error.status = 404;
      return next(error);
    }
    
    res.status(200).json({
      status: 'success',
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a manual quiz
 * @route POST /api/quiz/manual
 */
exports.createManualQuiz = async (req, res, next) => {
  try {
    // Set creation method
    req.body.createdBy = 'manual';
    
    // Create new quiz
    const quiz = await Quiz.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: quiz
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      error.status = 400;
    }
    next(error);
  }
};

/**
 * Create an AI-generated quiz
 * @route POST /api/quiz/ai
 */
exports.createAIQuiz = async (req, res, next) => {
  try {
    const { topic, difficulty, level, questionCount } = req.body;
    
    // Generate quiz with Gemini
    const generatedQuiz = await geminiService.generateQuiz({
      topic,
      difficulty,
      level,
      questionCount: questionCount || 5
    });
    
    // Create quiz in the database
    const quiz = await Quiz.create(generatedQuiz);
    
    res.status(201).json({
      status: 'success',
      data: quiz
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      error.status = 400;
    } else {
      error.status = 500;
    }
    next(error);
  }
};

/**
 * Update a quiz
 * @route PUT /api/quiz/:id
 */
exports.updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true // Run validators on update
      }
    );
    
    if (!quiz) {
      const error = new Error('Quiz not found');
      error.status = 404;
      return next(error);
    }
    
    res.status(200).json({
      status: 'success',
      data: quiz
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      error.status = 400;
    }
    next(error);
  }
};

/**
 * Delete a quiz
 * @route DELETE /api/quiz/:id
 */
exports.deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    
    if (!quiz) {
      const error = new Error('Quiz not found');
      error.status = 404;
      return next(error);
    }
    
    res.status(200).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
}; 