const express = require('express');
const router = express.Router();

// Import controllers
const courseController = require('../controllers/courseController');
const subcategoryController = require('../controllers/subcategoryController');
const lessonController = require('../controllers/lessonController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');

// Debugging middleware to log route access
const routeLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Accessing route: ${req.method} ${req.path}`);
  next();
};

// Helper function to safely wrap route handlers
const safeRouteHandler = (controller, methodName) => {
  return async (req, res, next) => {
    try {
      // Verify the controller method exists
      if (typeof controller[methodName] !== 'function') {
        console.error(`Route Error: ${methodName} is not a valid function in the controller`);
        return res.status(500).json({
          success: false,
          message: `Server configuration error: ${methodName} method not found`
        });
      }
      
      // Execute the controller method
      await controller[methodName](req, res, next);
    } catch (error) {
      console.error(`Error in ${methodName} route handler:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

// Extensive logging of imported controllers
console.log('Imported Controllers:');
console.log('Course Controller:', Object.keys(courseController));
console.log('Subcategory Controller:', Object.keys(subcategoryController));
console.log('Lesson Controller:', Object.keys(lessonController));

// Public routes (no authentication required)
router.get('/courses', 
  routeLogger, 
  safeRouteHandler(courseController, 'getAllCourses')
);

router.get('/courses/:id', 
  routeLogger, 
  safeRouteHandler(courseController, 'getCourseById')
);

// Protected routes (require authentication)
router.get('/user/course', 
  routeLogger,
  userAuthMiddleware, 
  safeRouteHandler(courseController, 'getUserCourse')
);

// Add this route to match what your Angular service is expecting
router.get('/subcategories/course/:courseId', 
  routeLogger,
  safeRouteHandler(subcategoryController, 'getSubcategoriesByCourse')
);

router.get('/subcategories/:id', 
  routeLogger,
  userAuthMiddleware, 
  safeRouteHandler(subcategoryController, 'getSubcategoryById')
);

router.get('/subcategories/:subcategoryId/lessons', 
  routeLogger,
  userAuthMiddleware, 
  safeRouteHandler(lessonController, 'getLessonsForSubcategory')
);

router.get('/subcategories/:subcategoryId/lessons/:lessonId', 
  routeLogger,
  userAuthMiddleware, 
  safeRouteHandler(lessonController, 'getLessonById')
);

// Error handling middleware for this router
router.use((err, req, res, next) => {
  console.error('Unhandled route error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred in course routes',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = router;