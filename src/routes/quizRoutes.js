const express = require('express');
const router = express.Router();

// Import controllers
const quizController = require('../controllers/quizController');

// Import validation middleware
const { validateRequest, schemas } = require('../middleware/validateRequest');

// Routes
// GET all quizzes
router.get('/', quizController.getAllQuizzes);

// GET a single quiz
router.get('/:id', quizController.getQuiz);

// POST a new quiz manually
router.post('/manual', validateRequest(schemas.quizSchema), quizController.createManualQuiz);

// POST a new AI-generated quiz
router.post('/ai', validateRequest(schemas.aiQuizRequestSchema), quizController.createAIQuiz);

// PUT update a quiz
router.put('/:id', validateRequest(schemas.quizSchema), quizController.updateQuiz);

// DELETE a quiz
router.delete('/:id', quizController.deleteQuiz);

module.exports = router; 