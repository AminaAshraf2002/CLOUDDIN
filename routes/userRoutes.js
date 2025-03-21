// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile 
} = require('../controllers/userController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');

// Public Routes (no authentication needed)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Routes (require authentication and approval)
router.get('/profile', userAuthMiddleware, getUserProfile);

module.exports = router;