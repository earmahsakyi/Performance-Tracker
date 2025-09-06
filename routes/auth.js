const express  = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const SecretKey = require('../middleware/checkSecretKey')
const { check, body } =require('express-validator');

router.get('/',auth, authController.getLoginUser);
router.post('/login', [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists()
], authController.AuthUserToken);
router.post('/register',SecretKey,[
    check('email', 'Please enter your email').isEmail(),
    check('password', 'Please enter a password with 8 or more characters').isLength({min: 8}),

    
], 
authController.registerUser);
router.post('/forgot-password', 
    [
      body('email').isEmail().withMessage(('Invalid Email Format'))  
    ],
    authController.forgotPassword



  )

router.post('/verify-email', 
    [check("email", "Please include a valid email").isEmail(),],
    authController.verifyEmail

)
router.post('/confirm-email-verification', 
    [
         check('email', 'Please enter a valid email').isEmail(),
  check('code', 'Verification code is required').notEmpty()
    ],
    authController.confirmEmailVerification

)

router.post('/reset-password', 
    [
      check('password', 'Please enter a password with 6 or more characters').isLength({min : 8})  
    ],
    authController.ResetPassword

)
router.get('/users',auth,authController.getAllUsers)
router.get('/:id',auth,authController.getUserById)




module.exports = router;

