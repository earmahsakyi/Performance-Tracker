const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const SecretKey = require('../middleware/checkSecretKey');
const { check, body } = require('express-validator');
const { 
  authLimiter, 
  passwordResetLimiter, 
  emailVerificationLimiter 
} = require('../middleware/rateLimiter');
const getClientIp = require('../middleware/getClientIp');

// Apply IP extraction to all auth routes
router.use(getClientIp);

// Get logged in user
router.get('/', auth, authController.getLoginUser);

// Login with rate limiting
router.post(
  '/login',
  authLimiter, // 5 attempts per 15 minutes per IP
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.AuthUserToken
);

// Register with rate limiting
router.post(
  '/register',
  authLimiter, // 5 attempts per 15 minutes per IP
  SecretKey,
  [
    check('email', 'Please enter your email').isEmail(),
    check('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 })
  ],
  authController.registerUser
);

// Forgot password with stricter rate limiting
router.post(
  '/forgot-password',
  passwordResetLimiter, // 3 attempts per hour per IP
  [
    body('email').isEmail().withMessage('Invalid Email Format')
  ],
  authController.forgotPassword
);

// Verify email with rate limiting
router.post(
  '/verify-email',
  emailVerificationLimiter, // 5 attempts per hour per IP
  [
    check('email', 'Please include a valid email').isEmail()
  ],
  authController.verifyEmail
);

// Confirm email verification with rate limiting
router.post(
  '/confirm-email-verification',
  emailVerificationLimiter, // 5 attempts per hour per IP
  [
    check('email', 'Please enter a valid email').isEmail(),
    check('code', 'Verification code is required').notEmpty()
  ],
  authController.confirmEmailVerification
);

// Reset password with rate limiting
router.post(
  '/reset-password',
  passwordResetLimiter, // 3 attempts per hour per IP
  [
    check('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 })
  ],
  authController.ResetPassword
);
//unlock route
router.post('/unlock/:userId',auth, authController.unlockUser);

//add user
router.post('/add-user', auth, authController.createUser);


// Get all users (protected)
router.get('/users', auth, authController.getAllUsers);

// Get user by ID (protected)
router.get('/users/:id', auth, authController.getUserById);

//delete user
router.delete('/users/:id', auth, authController.deleteUser);

//edit user
router.put('/users/:id', auth, authController.editUser);

module.exports = router;