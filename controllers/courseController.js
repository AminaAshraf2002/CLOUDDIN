// controllers/courseController.js
const { Course, Subcategory, Lesson } = require('../models/CourseModels');
const User = require('../models/User');

// Predefined course mapping for consistent naming
const COURSE_MAP = {
  1: 'Digital Marketing',
  2: 'E-commerce Mystery',
  3: 'Graphic Designing'
};

const courseController = {
  // Get all available courses
  getAllCourses: async (req, res) => {
    try {
      console.group('Get All Courses');
      
      // Fetch all courses with minimal details
      const courses = await Course.find({}).select('id title description thumbnail level');
      
      console.log(`Total Courses Found: ${courses.length}`);
      console.groupEnd();

      res.status(200).json({ 
        success: true, 
        count: courses.length,
        data: courses 
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching courses',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get a specific course by ID
  getCourseById: async (req, res) => {
    try {
      console.group('Get Course by ID');
      
      const courseId = parseInt(req.params.id);
      
      // Validate course ID
      if (isNaN(courseId)) {
        console.warn('Invalid course ID format');
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid course ID format' 
        });
      }

      // Find course with detailed information
      const course = await Course.findOne({ id: courseId })
        .populate({
          path: 'subcategories',
          select: 'title description',
          populate: {
            path: 'lessons',
            select: 'title description'
          }
        });

      // Check if course exists
      if (!course) {
        console.warn(`Course with ID ${courseId} not found`);
        return res.status(404).json({ 
          success: false, 
          message: 'Course not found' 
        });
      }

      console.log(`Found Course: ${course.title}`);
      console.groupEnd();

      res.status(200).json({ 
        success: true, 
        data: course 
      });
    } catch (error) {
      console.error(`Error fetching course ${req.params.id}:`, error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching course',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get course for the logged-in user
  getUserCourse: async (req, res) => {
    try {
      console.group('Get User Course');
      
      // Comprehensive user validation
      if (!req.user || !req.user._id) {
        console.warn('Unauthorized: No user ID found');
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized: User not authenticated' 
        });
      }

      const userId = req.user._id;
      
      // Find user with course details
      const user = await User.findById(userId);

      // Validate user existence
      if (!user) {
        console.warn(`User with ID ${userId} not found`);
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Validate course assignment
      if (!user.courseId) {
        console.warn(`User ${userId} has no assigned course`);
        return res.status(404).json({ 
          success: false, 
          message: 'No course assigned to this user' 
        });
      }

      // Find course details
      const course = await Course.findOne({ id: user.courseId })
        .populate({
          path: 'subcategories',
          select: 'title description lessons',
          populate: {
            path: 'lessons',
            select: 'title description'
          }
        });

      // Validate course existence
      if (!course) {
        console.warn(`Course with ID ${user.courseId} not found`);
        return res.status(404).json({ 
          success: false, 
          message: 'Assigned course not found' 
        });
      }

      // Prepare comprehensive course response
      const courseResponse = {
        id: course.id,
        title: course.title,
        description: course.description || '',
        thumbnail: course.thumbnail || 'default-thumbnail.jpg',
        instructor: course.instructor || 'Not Specified',
        level: course.level || 'beginner',
        courseName: user.courseName || COURSE_MAP[user.courseId] || 'Unspecified Course',
        progress: 0, // Placeholder for future progress tracking
        subcategories: course.subcategories.map(subcategory => ({
          id: subcategory._id,
          title: subcategory.title,
          description: subcategory.description,
          lessonCount: subcategory.lessons.length
        })),
        totalLessons: course.subcategories.reduce((total, subcategory) => 
          total + subcategory.lessons.length, 0)
      };

      console.log('Course Response:', courseResponse);
      console.groupEnd();

      res.status(200).json({
        success: true,
        data: courseResponse
      });

    } catch (error) {
      console.error('Detailed Error in getUserCourse:', {
        message: error.message,
        stack: error.stack
      });

      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching user course',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Additional utility methods can be added here
  getCourseSubcategories: async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      
      if (isNaN(courseId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid course ID' 
        });
      }

      const subcategories = await Subcategory.find({ courseId })
        .populate({
          path: 'lessons',
          select: 'title description'
        });

      res.status(200).json({
        success: true,
        data: subcategories
      });
    } catch (error) {
      console.error('Error fetching course subcategories:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching subcategories',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = courseController;