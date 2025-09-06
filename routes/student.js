const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload, uploadToS3 } = require('../middleware/s3Uploader');
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentByUserId,
  addPerformanceScore,
  updateCourseProgress
} = require('../controllers/studentController');

// @route   POST /api/student
// @desc    Create student profile
// @access  Private
router.post('/', auth, upload, async (req, res, next) => {
  try {
    const files = req.files;
    const uploadedUrls = {};
    const role = 'Student';

    // Only process files if they exist
    if (files) {
      for (const field in files) {
        const file = files[field][0];
        const url = await uploadToS3(file, role);
        uploadedUrls[field] = url;
      }
      req.body.uploadedUrls = uploadedUrls;
    }
    
    next();
  } catch (err) {
    console.error('File upload error:', err.message || "server error");
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
}, createStudent);

// @route   GET /api/student (Get all students)
// @desc    Get all students with optional filtering
// @access  Private (Admin only)
router.get('/', auth, getStudents);

// @route   GET /api/student/user/:userId (Get by user ID - must come before /:id)
// @desc    Get student by user ID
// @access  Private
router.get('/user/:userId', auth, getStudentByUserId);

// @route   GET /api/student/:id
// @desc    Get single student by ID
// @access  Private
router.get('/:id', auth, getStudentById);

// @route   PUT /api/student/:id
// @desc    Update student profile
// @access  Private
router.put('/:id', auth, upload, async (req, res, next) => {
  try {
    const files = req.files;
    const uploadedUrls = {};
    const role = 'Student';

    // Only process files if they exist
    if (files) {
      for (const field in files) {
        const file = files[field][0];
        const url = await uploadToS3(file, role);
        uploadedUrls[field] = url;
      }
      req.body.uploadedUrls = uploadedUrls;
    }
    
    next();
  } catch (err) {
    console.error('File upload error:', err.message || "server error");
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
}, updateStudent);

// @route   DELETE /api/student/:id
// @desc    Delete student profile
// @access  Private (Admin only)
router.delete('/:id', auth, deleteStudent);

// @route   POST /api/student/:id/performance
// @desc    Add performance score
// @access  Private
router.post('/:id/performance', auth, addPerformanceScore);

// @route   PUT /api/student/:id/progress/:courseId
// @desc    Update course progress
// @access  Private
router.put('/:id/progress/:courseId', auth, updateCourseProgress);

module.exports = router;