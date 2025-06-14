const express = require('express');
const {
  inviteToQuiz,
  getQuizInvitations,
  getMyInvitations,
  respondToInvitation
} = require('../controllers/invitationController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Teacher routes
router.post('/quiz/:quizId', authorize('teacher'), inviteToQuiz);
router.get('/quiz/:quizId', authorize('teacher'), getQuizInvitations);

// Student routes
router.get('/student', authorize('student'), getMyInvitations);
router.put('/:invitationId/respond', authorize('student'), respondToInvitation);

module.exports = router; 