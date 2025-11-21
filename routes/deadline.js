// routes/deadlineRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const deadlineController = require('../controllers/deadlineController');

// @route   POST /api/deadlines/create
router.post('/create', auth, deadlineController.createDeadline);

// @route   GET /api/deadlines/student/:studentId
router.get('/student/:studentId', auth, deadlineController.getDeadlinesForStudent);

// @route   GET /api/deadlines/instructor
router.get('/instructor', auth, deadlineController.getDeadlinesByCreator);
router.get('/course/:courseId', auth, deadlineController.getDeadlinesByCourse);

// @route   GET /api/deadlines/all
router.get('/all', auth, deadlineController.getAllDeadlines);

// @route   PUT /api/deadlines/:deadlineId
router.put('/:deadlineId', auth, deadlineController.updateDeadline);

// @route   DELETE /api/deadlines/:deadlineId
router.delete('/:deadlineId', auth, deadlineController.deleteDeadline);

module.exports = router;