// controllers/courseController.js
const { Course, Subcategory, Lesson } = require('../models/CourseModels');
const User = require('../models/User'); // Your existing User model

const courseController = {
  // Get all courses
  getAllCourses: async (req, res) => {
    try {
      console.log('Getting all courses...');
      const courses = await Course.find({});
      console.log(`Found ${courses.length} courses`);
      res.status(200).json({ success: true, data: courses });
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ success: false, message: 'Server error while fetching courses' });
    }
  },

  // Get a single course by ID
  getCourseById: async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      
      if (isNaN(courseId)) {
        return res.status(400).json({ success: false, message: 'Invalid course ID format' });
      }
      
      console.log(`Looking for course with ID: ${courseId}`);
      const course = await Course.findOne({ id: courseId });
      
      if (!course) {
        console.log(`Course with ID ${courseId} not found`);
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      console.log(`Found course: ${course.title}`);
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      console.error(`Error fetching course ${req.params.id}:`, error);
      res.status(500).json({ success: false, message: 'Server error while fetching course' });
    }
  },

  // Get course for the logged-in user
  getUserCourse: async (req, res) => {
    try {
      const userId = req.user._id;
      console.log(`Looking for course for user ID: ${userId}`);
      
      const user = await User.findById(userId);
      
      if (!user) {
        console.log(`User with ID ${userId} not found`);
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      if (!user.courseId) {
        console.log(`User ${userId} has no assigned course`);
        return res.status(404).json({ success: false, message: 'No course assigned to this user' });
      }
      
      console.log(`Looking for course with ID: ${user.courseId}`);
      const course = await Course.findOne({ id: user.courseId });
      
      if (!course) {
        console.log(`Course with ID ${user.courseId} not found`);
        return res.status(404).json({ success: false, message: 'Assigned course not found' });
      }
      
      console.log(`Found course: ${course.title}`);
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      console.error('Error fetching user course:', error);
      res.status(500).json({ success: false, message: 'Server error while fetching user course' });
    }
  }
};

module.exports = courseController;