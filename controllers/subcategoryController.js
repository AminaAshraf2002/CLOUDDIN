// controllers/subcategoryController.js
const { Course, Subcategory, Lesson } = require('../models/CourseModels');
const User = require('../models/User'); // Your existing User model

const subcategoryController = {
  // Get all subcategories for a course
  getSubcategoriesForCourse: async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      
      if (isNaN(courseId)) {
        return res.status(400).json({ success: false, message: 'Invalid course ID format' });
      }
      
      console.log(`Looking for subcategories for course ID: ${courseId}`);
      
      // Verify user access if needed
      if (req.user) {
        const user = await User.findById(req.user._id);
        if (user.courseId !== courseId) {
          console.log(`User ${req.user._id} does not have access to course ${courseId}`);
          return res.status(403).json({ success: false, message: 'You do not have access to this course' });
        }
      }
      
      const subcategories = await Subcategory.find({ courseId }).sort({ order: 1 });
      console.log(`Found ${subcategories.length} subcategories for course ${courseId}`);
      
      res.status(200).json({ success: true, data: subcategories });
    } catch (error) {
      console.error(`Error fetching subcategories for course ${req.params.courseId}:`, error);
      res.status(500).json({ success: false, message: 'Server error while fetching subcategories' });
    }
  },

  // Get a single subcategory by ID
  getSubcategoryById: async (req, res) => {
    try {
      const subcategoryId = parseInt(req.params.id);
      
      if (isNaN(subcategoryId)) {
        return res.status(400).json({ success: false, message: 'Invalid subcategory ID format' });
      }
      
      console.log(`Looking for subcategory with ID: ${subcategoryId}`);
      const subcategory = await Subcategory.findOne({ id: subcategoryId });
      
      if (!subcategory) {
        console.log(`Subcategory with ID ${subcategoryId} not found`);
        return res.status(404).json({ success: false, message: 'Subcategory not found' });
      }
      
      // Verify user access if needed
      if (req.user) {
        const user = await User.findById(req.user._id);
        if (user.courseId !== subcategory.courseId) {
          console.log(`User ${req.user._id} does not have access to subcategory ${subcategoryId}`);
          return res.status(403).json({ success: false, message: 'You do not have access to this subcategory' });
        }
      }
      
      console.log(`Found subcategory: ${subcategory.title}`);
      res.status(200).json({ success: true, data: subcategory });
    } catch (error) {
      console.error(`Error fetching subcategory ${req.params.id}:`, error);
      res.status(500).json({ success: false, message: 'Server error while fetching subcategory' });
    }
  }
};

module.exports = subcategoryController;