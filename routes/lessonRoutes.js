const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin routes (require admin authentication)
// Create a new lesson (admin access)
router.post('/subcategory/:subcategoryId', authMiddleware, lessonController.createLesson);

// Update a lesson (admin access)
router.put('/subcategory/:subcategoryId/lesson/:lessonId', authMiddleware, lessonController.updateLesson);

// Delete a lesson (admin access)
router.delete('/subcategory/:subcategoryId/lesson/:lessonId', authMiddleware, lessonController.deleteLesson);

// Public routes (no authentication required)
// Get all lessons for a subcategory
router.get('/subcategory/:subcategoryId', lessonController.getLessonsBySubcategory);

// Get a specific lesson by ID
router.get('/subcategory/:subcategoryId/lesson/:lessonId', lessonController.getLessonById);

module.exports = router;