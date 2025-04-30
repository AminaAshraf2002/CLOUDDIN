// controllers/subcategoryController.js
const { Subcategory, Course, Lesson } = require('../models/CourseModels');

// Helper function for consistent error handling
const handleError = (res, error, message = 'Server error') => {
  console.error(`Subcategory Error: ${message}`, error);
  return res.status(500).json({ success: false, message });
};

// Get all subcategories (admin access)
exports.getAllSubcategories = async (req, res) => {
  try {
    console.log('Fetching all subcategories');
    const subcategories = await Subcategory.find().sort({ title: 1 });
    
    res.json({ success: true, data: subcategories });
  } catch (error) {
    return handleError(res, error, 'Error retrieving subcategories');
  }
};

// Create a new subcategory (admin access)
exports.createSubcategory = async (req, res) => {
  try {
    // Extract subcategory data from request body
    const { title, description, courseId, thumbnail, id } = req.body;
    
    console.log('Creating subcategory with data:', { title, courseId });
    
    // Validate required fields
    if (!title || !courseId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and course ID are required' 
      });
    }
    
    // Parse courseId to ensure it's a number
    const parsedCourseId = parseInt(courseId);
    
    if (isNaN(parsedCourseId)) {
      return res.status(400).json({
        success: false,
        message: 'Course ID must be a number'
      });
    }
    
    // Validate that the course exists
    const courseExists = await Course.findOne({ id: parsedCourseId });
    
    if (!courseExists) {
      return res.status(404).json({ 
        success: false, 
        message: `Course with ID ${parsedCourseId} not found` 
      });
    }
    
    // Generate a new subcategory ID if not provided
    let subcategoryId = id;
    if (!subcategoryId) {
      // Find the highest existing ID and increment
      const highestSubcategory = await Subcategory.findOne({}).sort('-id');
      subcategoryId = highestSubcategory ? highestSubcategory.id + 1 : 1;
    }
    
    // Create new subcategory
    const newSubcategory = new Subcategory({
      id: subcategoryId,
      title,
      description,
      courseId: parsedCourseId, // Store as a number
      thumbnail,
      order: 0 // Default order
    });
    
    // Save to database
    const savedSubcategory = await newSubcategory.save();
    
    console.log(`Subcategory created successfully with ID: ${savedSubcategory.id}`);
    
    // Return success response
    res.status(201).json({ 
      success: true, 
      message: 'Subcategory created successfully',
      data: savedSubcategory
    });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    return handleError(res, error, 'Error creating subcategory');
  }
};

// Update a subcategory (admin access)
exports.updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, courseId, thumbnail } = req.body;
    
    console.log(`Updating subcategory ${id} with data:`, req.body);
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title is required' 
      });
    }
    
    // Parse courseId to ensure it's a number if provided
    let parsedCourseId;
    if (courseId) {
      parsedCourseId = parseInt(courseId);
      
      if (isNaN(parsedCourseId)) {
        return res.status(400).json({
          success: false,
          message: 'Course ID must be a number'
        });
      }
      
      // Validate that the course exists
      const courseExists = await Course.findOne({ id: parsedCourseId });
      
      if (!courseExists) {
        return res.status(404).json({ 
          success: false, 
          message: `Course with ID ${parsedCourseId} not found` 
        });
      }
    }
    
    // Find subcategory by ID (numeric ID field, not MongoDB _id)
    const subcategory = await Subcategory.findOne({ id: parseInt(id) });
    
    if (!subcategory) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subcategory not found' 
      });
    }
    
    // Update fields
    subcategory.title = title;
    if (description !== undefined) subcategory.description = description;
    if (parsedCourseId) subcategory.courseId = parsedCourseId;
    if (thumbnail !== undefined) subcategory.thumbnail = thumbnail;
    
    // Save changes
    const updatedSubcategory = await subcategory.save();
    
    console.log(`Subcategory ${id} updated successfully`);
    
    // Return success response
    res.json({ 
      success: true, 
      message: 'Subcategory updated successfully',
      data: updatedSubcategory
    });
  } catch (error) {
    console.error(`Error updating subcategory ${req.params.id}:`, error);
    return handleError(res, error, 'Error updating subcategory');
  }
};

// Delete a subcategory (admin access)
exports.deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Deleting subcategory with ID: ${id}`);
    
    // Find and delete the subcategory (by numeric ID field)
    const deletedSubcategory = await Subcategory.findOneAndDelete({ id: parseInt(id) });
    
    // Check if subcategory exists
    if (!deletedSubcategory) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subcategory not found' 
      });
    }
    
    // Also delete associated lessons
    await Lesson.deleteMany({ subcategoryId: parseInt(id) });
    
    console.log(`Subcategory ${id} and its lessons deleted successfully`);
    
    // Return success response
    res.json({ 
      success: true, 
      message: 'Subcategory and associated lessons deleted successfully' 
    });
  } catch (error) {
    console.error(`Error deleting subcategory ${req.params.id}:`, error);
    return handleError(res, error, 'Error deleting subcategory');
  }
};

// Get subcategories by course ID - THIS IS THE PROBLEMATIC ENDPOINT - FIXED
exports.getSubcategoriesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    console.log(`Fetching subcategories for course ID: ${courseId}`);
    
    // Parse courseId to ensure it's a number
    const parsedCourseId = parseInt(courseId);
    
    if (isNaN(parsedCourseId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid course ID format' 
      });
    }
    
    // Validate that the course exists
    const courseExists = await Course.findOne({ id: parsedCourseId });
    
    if (!courseExists) {
      console.log(`Course with ID ${parsedCourseId} not found`);
      // Return empty array instead of error if course doesn't exist
      return res.json({ 
        success: true, 
        data: [],
        message: 'Course not found' 
      });
    }
    
    // Find all subcategories for the given course (using numeric courseId field)
    const subcategories = await Subcategory.find({ courseId: parsedCourseId })
      .sort({ order: 1, title: 1 });
    
    console.log(`Found ${subcategories.length} subcategories for course ${parsedCourseId}`);
    
    // For each subcategory, get its lessons
    const subcategoriesWithLessons = await Promise.all(subcategories.map(async (subcategory) => {
      const lessons = await Lesson.find({ subcategoryId: subcategory.id })
        .sort({ order: 1, day: 1 });
      
      // Create a formatted response object
      return {
        id: subcategory.id,
        title: subcategory.title,
        description: subcategory.description,
        thumbnail: subcategory.thumbnail,
        courseId: subcategory.courseId,
        lessonCount: lessons.length,
        lessons: lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          day: lesson.day,
          videoUrl: lesson.videoUrl,
          topics: lesson.topics,
          duration: lesson.duration
        }))
      };
    }));
    
    // Return successful response
    res.json({ 
      success: true, 
      data: subcategoriesWithLessons
    });
  } catch (error) {
    console.error('Error in getSubcategoriesByCourse:', error);
    return handleError(res, error, 'Server error while fetching subcategories');
  }
};

// Get subcategory by ID
exports.getSubcategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Fetching subcategory with ID: ${id}`);
    
    // Find the subcategory by numeric ID (not MongoDB _id)
    const subcategory = await Subcategory.findOne({ id: parseInt(id) });
    
    // Check if subcategory exists
    if (!subcategory) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subcategory not found' 
      });
    }
    
    // Get lessons for this subcategory
    const lessons = await Lesson.find({ subcategoryId: parseInt(id) })
      .sort({ order: 1, day: 1 });
    
    // Create a response with the subcategory and its lessons
    const response = {
      id: subcategory.id,
      title: subcategory.title,
      description: subcategory.description,
      thumbnail: subcategory.thumbnail,
      courseId: subcategory.courseId,
      lessons: lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        day: lesson.day,
        videoUrl: lesson.videoUrl,
        topics: lesson.topics,
        duration: lesson.duration
      }))
    };
    
    console.log(`Found subcategory ${id} with ${lessons.length} lessons`);
    
    // Return success response
    res.json({ 
      success: true, 
      data: response
    });
  } catch (error) {
    console.error(`Error retrieving subcategory ${req.params.id}:`, error);
    return handleError(res, error, 'Error retrieving subcategory');
  }
};

// Add lesson to subcategory (additional utility function)
exports.addLessonToSubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const lessonData = req.body;
    
    console.log(`Adding lesson to subcategory ${subcategoryId}:`, lessonData);
    
    // Validate subcategory exists
    const subcategory = await Subcategory.findOne({ id: parseInt(subcategoryId) });
    
    if (!subcategory) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subcategory not found' 
      });
    }
    
    // Generate lesson ID if not provided
    if (!lessonData.id) {
      // Find highest lesson ID and increment
      const highestLesson = await Lesson.findOne({}).sort('-id');
      lessonData.id = highestLesson ? highestLesson.id + 1 : 1;
    }
    
    // Create and save new lesson
    const newLesson = new Lesson({
      ...lessonData,
      subcategoryId: parseInt(subcategoryId)
    });
    
    await newLesson.save();
    
    console.log(`Lesson ${newLesson.id} added to subcategory ${subcategoryId}`);
    
    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      data: newLesson
    });
  } catch (error) {
    console.error(`Error adding lesson to subcategory ${req.params.subcategoryId}:`, error);
    return handleError(res, error, 'Error adding lesson to subcategory');
  }
};