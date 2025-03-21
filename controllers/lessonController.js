// controllers/lessonController.js
const { Course, Subcategory, Lesson } = require('../models/CourseModels');
const User = require('../models/User'); // Your existing User model

const lessonController = {
  // Get all lessons for a subcategory
  getLessonsForSubcategory: async (req, res) => {
    try {
      const subcategoryId = parseInt(req.params.subcategoryId);
      
      if (isNaN(subcategoryId)) {
        return res.status(400).json({ success: false, message: 'Invalid subcategory ID format' });
      }
      
      console.log(`Looking for lessons in subcategory with ID: ${subcategoryId}`);
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
          return res.status(403).json({ success: false, message: 'You do not have access to these lessons' });
        }
      }
      
      // Sort lessons by day
      const lessons = subcategory.lessons.sort((a, b) => a.day - b.day);
      console.log(`Found ${lessons.length} lessons in subcategory ${subcategoryId}`);
      
      res.status(200).json({ success: true, data: lessons });
    } catch (error) {
      console.error(`Error fetching lessons for subcategory ${req.params.subcategoryId}:`, error);
      res.status(500).json({ success: false, message: 'Server error while fetching lessons' });
    }
  },

  // Get a single lesson by ID
  getLessonById: async (req, res) => {
    try {
      const subcategoryId = parseInt(req.params.subcategoryId);
      const lessonId = parseInt(req.params.lessonId);
      
      if (isNaN(subcategoryId) || isNaN(lessonId)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      
      console.log(`Looking for lesson ${lessonId} in subcategory ${subcategoryId}`);
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
          return res.status(403).json({ success: false, message: 'You do not have access to this lesson' });
        }
      }
      
      const lesson = subcategory.lessons.find(lesson => lesson.id === lessonId);
      
      if (!lesson) {
        console.log(`Lesson with ID ${lessonId} not found in subcategory ${subcategoryId}`);
        return res.status(404).json({ success: false, message: 'Lesson not found' });
      }
      
      console.log(`Found lesson: ${lesson.title}`);
      res.status(200).json({ success: true, data: lesson });
    } catch (error) {
      console.error(`Error fetching lesson ${req.params.lessonId}:`, error);
      res.status(500).json({ success: false, message: 'Server error while fetching lesson' });
    }
  }
};

module.exports = lessonController;