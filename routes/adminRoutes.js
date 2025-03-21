// File: routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { 
  loginAdmin, 
  getAdminProfile,
  logoutAdmin 
} = require('../controllers/authController');
const { 
  getPendingUsers,
  getAllUsers,
  getUserCount,
  getRecentUsers,
  approveUser,
  deleteUser,
  checkUserStatus // Import the new function
} = require('../controllers/adminUserController');
const authMiddleware = require('../middleware/authMiddleware');

// Public Routes
router.post('/login', loginAdmin);

// Protected Routes
router.get('/profile', authMiddleware, getAdminProfile);
router.post('/logout', authMiddleware, logoutAdmin);

// User management routes
router.get('/users/pending', authMiddleware, getPendingUsers);
router.get('/users', authMiddleware, getAllUsers);
router.get('/users/count', authMiddleware, getUserCount);
router.get('/users/recent', authMiddleware, getRecentUsers);
router.put('/users/:userId/approve', authMiddleware, approveUser);
router.delete('/users/:userId', authMiddleware, deleteUser);

// New route for checking user status - helpful for debugging
router.get('/users/:userId/status', authMiddleware, checkUserStatus);

module.exports = router;