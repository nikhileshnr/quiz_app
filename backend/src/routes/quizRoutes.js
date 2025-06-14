const express = require('express');
const { 
  createQuiz,
  getQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizResults,
  submitQuiz,
  getMyAttempts,
  createAIQuiz,
  verifyQuestion,
  regenerateQuestions,
  createManualQuiz
} = require('../controllers/quizController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes - require login
router.use(protect);

// Get all quizzes based on user role
router.get('/', getQuizzes);

// Routes available to students only
router.get('/my-attempts', authorize('student'), getMyAttempts);
router.post('/:id/submit', authorize('student'), submitQuiz);

// Routes available to teachers only
router.post('/', authorize('teacher'), createQuiz);
router.post('/ai', authorize('teacher'), createAIQuiz);
router.post('/manual', authorize('teacher'), createManualQuiz);
router.get('/:id/results', authorize('teacher'), getQuizResults);

// AI-related routes
router.post('/verify-question', verifyQuestion);
router.post('/regenerate-questions', regenerateQuestions);

// Routes accessible to both but with role-specific permissions
router.get('/:id', getQuiz);
router.put('/:id', authorize('teacher'), updateQuiz);
router.delete('/:id', authorize('teacher'), deleteQuiz);

module.exports = router; 