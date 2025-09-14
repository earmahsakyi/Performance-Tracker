const express = require('express');
const router = express.Router();
const adminForumController = require('../controllers/adminForumController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// Category management validation
const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Description must be between 10 and 200 characters'),
  body('color')
    .optional()
    .matches(/^bg-\w+-\d+$/)
    .withMessage('Invalid color format'),
  body('icon')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Invalid icon name')
];

// Admin-only routes
router.use(auth);

// Category management
router.post('/categories', categoryValidation, validate, adminForumController.createCategory);
router.put('/categories/:categoryId', categoryValidation, validate, adminForumController.updateCategory);
router.delete('/categories/:categoryId', adminForumController.deleteCategory);

// Post moderation
router.put('/posts/:postId/pin', adminForumController.togglePinPost);
router.put('/posts/:postId/lock', adminForumController.toggleLockPost);
router.delete('/posts/:postId', adminForumController.deletePost);

// Comment moderation
// router.delete('/comments/:commentId', adminForumController.);
// router.put('/comments/:commentId/restore', adminForumController.restoreComment);

// // Reports management
// router.get('/reports', adminForumController.getReports);
// router.put('/reports/:reportId/resolve', adminForumController.resolveReport);

// Forum analytics
router.get('/analytics', adminForumController.getForumAnalytics);

module.exports = router;