// routes/forumRoutes.js
const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const auth = require('../middleware/auth'); 
const { body } = require('express-validator');
const validate = require('../middleware/validate'); 

// Validation rules
const postValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  body('categoryId')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
  body('relatedCourse')
    .optional()
    .isMongoId()
    .withMessage('Invalid course ID')
];

const commentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters'),
  body('parentCommentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID')
];

const searchValidation = [
  body('q')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters')
];



// Public routes (with auth for user-specific data)
router.get('/dashboard', auth, forumController.getForumDashboard);
router.get('/categories', auth, forumController.getCategories);
router.get('/search', auth,searchValidation, validate, forumController.searchPosts);

// Category specific posts
router.get('/categories/:categoryId/posts', auth, forumController.getPostsByCategory);

// Posts routes
router.post('/posts', auth, postValidation, validate, forumController.createPost);
router.get('/posts/:postId', auth, forumController.getPost);
router.post('/posts/:postId/like', auth, forumController.togglePostLike);

// Comments routes
router.post('/posts/:postId/comments', auth, commentValidation, validate, forumController.addComment);


module.exports = router;

