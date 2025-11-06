const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student')
const { upload, uploadToS3 } = require('../middleware/s3Uploader');
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentByUserId,
  addPerformanceScore,
  updateCourseProgress,
  submitAssignment,
  getStudentAssignments,
  submitQuiz,
  markModuleComplete,
  getCourseProgressDetails,
  addNote,
  updateNote,
  deleteNote,
  getNotes,
  getNoteById,
  getStudentStats,
  getWeeklyActivity,
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

// @route   POST /api/student/:id/assignments
// @desc    Submit assignment
// @access  Private
router.post('/:id/assignments', auth, submitAssignment);

// @route   GET /api/student/:id/assignments/:courseId
// @desc    Get student assignments for a course
// @access  Private
router.get('/:id/assignments/:courseId', auth, getStudentAssignments);

// @route   POST /api/student/:id/quizzes
// @desc    Submit quiz/assessment
// @access  Private
router.post('/:id/quizzes', auth, submitQuiz);

// @route   PUT /api/student/:id/modules/complete
// @desc    Mark module as completed
// @access  Private
router.put('/:id/modules/complete', auth, markModuleComplete);

// @route   GET /api/student/:id/progress/:courseId/details
// @desc    Get detailed course progress
// @access  Private
router.get('/:id/progress/:courseId/details', auth, getCourseProgressDetails);

// @route   POST /api/student/:id/notes
// @desc    Add a new note
// @access  Private
router.post('/:id/notes', auth, addNote);

// @route   PUT /api/student/:id/notes/:noteId
// @desc    Update a note
// @access  Private
router.put('/:id/notes/:noteId', auth, updateNote);

// @route   DELETE /api/student/:id/notes/:noteId
// @desc    Delete a note
// @access  Private
router.delete('/:id/notes/:noteId', auth, deleteNote);

// @route   GET /api/student/:id/notes
// @desc    Get all notes for a student
// @access  Private
router.get('/:id/notes', auth, getNotes);

router.get('/:studentId/certificates', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findById(studentId)
      .populate('enrolledCourses.courseId');
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const earnedCertificates = [];
    const upcomingCertificates = [];

    for (const enrollment of student.enrolledCourses) {
      const course = enrollment.courseId;
      
      if (enrollment.progress >= 100) {
        // Earned certificate
        const avgScore = student.performanceScores
          .filter(score => score.courseId.toString() === course._id.toString())
          .reduce((sum, score, _, arr) => 
            arr.length > 0 ? sum + (score.score / score.maxScore * 100) / arr.length : 0, 0
          );

        earnedCertificates.push({
          title: `${course.title} Completion`,
          course: course.title,
          courseId: course._id,
          issueDate: enrollment.enrolledDate,
          completionScore: Math.round(avgScore) || 100,
          credentialId: `CERT-${course.code}-${Date.now()}`,
          status: "Active",
          skills: course.tags || [],
          canDownload: true
        });
      } else {
        // In progress
        upcomingCertificates.push({
          title: `${course.title} Completion`,
          course: course.title,
          courseId: course._id,
          progress: enrollment.progress,
          estimatedCompletion: course.endDate,
          requirements: ["Complete all modules", "Submit assignments", "Pass assessments"]
        });
      }
    }

    res.json({ earnedCertificates, upcomingCertificates });
    
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// @route   GET /api/student/:id/notes/:noteId
// @desc    Get a single note
// @access  Private
router.get('/:id/notes/:noteId', auth, getNoteById);

// @route   GET /api/student/:id/stats
// @desc    Get comprehensive student statistics
// @access  Private
router.get('/:id/stats', auth, getStudentStats);

// @route   GET /api/student/:id/activity/weekly  
// @desc    Get weekly activity data
// @access  Private
router.get('/:id/activity/weekly', auth, getWeeklyActivity);


module.exports = router;