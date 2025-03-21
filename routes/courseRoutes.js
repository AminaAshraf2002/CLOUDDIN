// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const subcategoryController = require('../controllers/subcategoryController');
const lessonController = require('../controllers/lessonController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware'); // Your existing middleware

// Public routes (no authentication required)
router.get('/courses', courseController.getAllCourses);
router.get('/courses/:id', courseController.getCourseById);

// Protected routes (require authentication)
router.get('/user/course', userAuthMiddleware, courseController.getUserCourse);
router.get('/courses/:courseId/subcategories', userAuthMiddleware, subcategoryController.getSubcategoriesForCourse);
router.get('/subcategories/:id', userAuthMiddleware, subcategoryController.getSubcategoryById);
router.get('/subcategories/:subcategoryId/lessons', userAuthMiddleware, lessonController.getLessonsForSubcategory);
router.get('/subcategories/:subcategoryId/lessons/:lessonId', userAuthMiddleware, lessonController.getLessonById);

module.exports = router;