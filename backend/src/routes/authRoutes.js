const express = require('express');
const { registerUser, loginUser, getCurrentUser, checkEmail } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/check-email', checkEmail);

// Protected routes
router.get('/me', protect, getCurrentUser);

module.exports = router; 