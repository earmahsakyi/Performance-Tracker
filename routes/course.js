const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
  getCourseStudents,
  addCourseAnnouncement,
  getCourseModules,
  updateCourseModule,
  advancedCourseSearch
} = require('../controllers/courseController');

// Routes with /api/courses prefix

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Admin/Instructor)
router.post('/', auth, createCourse);

// @route   GET /api/courses
// @desc    Get all courses with optional filtering and search
// @access  Public
router.get('/', auth, getCourses);

// @route   GET /api/courses/:id
// @desc    Get single course by ID
// @access  Public
router.get('/:id', auth, getCourseById);

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Admin/Instructor)
router.put('/:id', auth, updateCourse);

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Admin)
router.delete('/:id', auth, deleteCourse);

// @route   POST /api/courses/:courseId/enroll
// @desc    Enroll student in course
// @access  Private
router.post('/:courseId/enroll', auth, enrollStudent);

// @route   DELETE /api/courses/:courseId/unenroll/:studentId
// @desc    Unenroll student from course
// @access  Private
router.delete('/:courseId/unenroll/:studentId', auth, unenrollStudent);

// @route   GET /api/courses/:id/students
// @desc    Get all students enrolled in a course
// @access  Private
router.get('/:id/students', auth, getCourseStudents);

// @route   POST /api/courses/:id/announcements
// @desc    Add announcement to course
// @access  Private (Admin/Instructor)
router.post('/:id/announcements', auth, addCourseAnnouncement);

// @route   GET /api/courses/:id/modules
// @desc    Get course modules
// @access  Private (Enrolled students/Instructors)
router.get('/:id/modules', auth, getCourseModules);

// @route   PUT /api/courses/:id/modules/:moduleIndex
// @desc    Update specific module
// @access  Private (Admin/Instructor)
router.put('/:id/modules/:moduleIndex', auth, updateCourseModule);

// @route   GET /api/courses/search/advanced
// @desc    Advanced course search
// @access  Public
router.get('/search/advanced', auth, advancedCourseSearch);

module.exports = router;