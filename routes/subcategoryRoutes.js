// routes/subcategoryRoutes.js
const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin routes (require admin authentication)
// Get all subcategories (admin access)
router.get('/all', authMiddleware, subcategoryController.getAllSubcategories);

// Create a new subcategory (admin access)
router.post('/', authMiddleware, subcategoryController.createSubcategory);

// Update a subcategory (admin access)
router.put('/:id', authMiddleware, subcategoryController.updateSubcategory);

// Delete a subcategory (admin access)
router.delete('/:id', authMiddleware, subcategoryController.deleteSubcategory);

// Public routes (no authentication required)
// Get subcategories by course ID
router.get('/course/:courseId', subcategoryController.getSubcategoriesByCourse);

// Get subcategory by ID
router.get('/:id', subcategoryController.getSubcategoryById);

module.exports = router;