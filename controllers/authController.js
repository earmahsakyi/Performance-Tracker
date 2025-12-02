const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// const config = require('../config/default.json');
const { validationResult } =require('express-validator');
const sendEmail = require('../utils/sendEmail')

// const setNoCacheHeaders = (res) => {
//   res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
//   res.setHeader('Pragma', 'no-cache');
//   res.setHeader('Expires', '0');
// };


//@route GET api/auth
// desc Get logged in user
//@acces priavte
exports.getLoginUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      profileUpdated: user.profileUpdated,
     
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const MAX_ATTEMPTS = 3;
const LOCK_DURATIONS = {
  1: 30 * 60 * 1000, // 30 minutes
  2: 60 * 60 * 1000, // 1 hour
};

//@route Post api/auth
// desc Auth user & get token
//@access Private
exports.AuthUserToken = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    
    if (!user || !user.isVerified) {
      return res.status(400).json({ 
        msg: 'Invalid credentials or email not verified' 
      });
    }

    // Check manual lock
    if (user.lockedManually) {
      return res.status(423).json({ 
        msg: 'Account locked. Contact Admin to unlock.' 
      });
    }

    // Check timed lock
    if (user.lockUntil && user.lockUntil > new Date()) {
      const wait = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      return res.status(423).json({ 
        msg: `Account locked. Try again in ${wait} minute(s).` 
      });
    }

    // Clear expired lock
    if (user.lockUntil && user.lockUntil <= new Date()) {
      user.lockUntil = null;
      user.loginAttempts = 0;
      user.lockLevel = 0;
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= MAX_ATTEMPTS) {
        user.lockLevel += 1;

        if (user.lockLevel >= 3) {
          user.lockedManually = true;
          
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d32f2f;">Account Locked</h2>
              <p>Hello,</p>
              <p>We noticed multiple unsuccessful login attempts on your account associated with this email address.</p>
              <p>As a result, your account has been temporarily locked for security reasons.</p>
              <p>If you believe this was a mistake or you require urgent access, please contact the school administration to have your account reviewed and unlocked.</p>
              <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #d32f2f;">
                <strong>Status:</strong> Locked after too many failed attempts<br>
                <strong>Next step:</strong> Contact admin or wait if this is your 1st or 2nd lock.
              </div>
              <p>If this activity was not initiated by you, we recommend resetting your password after regaining access.</p>
              <p>Thank you,<br>School Management System Team</p>
            </div>
          `;

          // Send mail to locked account
          try {
            await sendEmail({
              to: email,
              subject: 'Account Locked',
              html,
            });
          } catch (emailErr) {
            console.error('Failed to send lock email:', emailErr);
          }
        } else {
          user.lockUntil = new Date(Date.now() + LOCK_DURATIONS[user.lockLevel]);
        }
      }

      await user.save();
      return res.status(400).json({ msg: 'Invalid Credentials' });
    } 

    // Password is correct - reset attempts and proceed with login
    if (user.loginAttempts > 0 || user.lockLevel > 0) {
      user.loginAttempts = 0;
      user.lockLevel = 0;
      user.lockUntil = null;
      await user.save();
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        profileUpdated: user.profileUpdated
      }
    };

    jwt.sign(
      payload,
      process.env.jwtSecret,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          role: user.role,
          userID: user.id,
          profileUpdated: user.profileUpdated
        });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Register a user
// access public

exports.registerUser = async (req, res) => {
     const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()});
    }
    const { email, password, role } = req.body; 
    try{
        let user = await User.findOne({ email });
        if(user){
            return res.status(400).json({ msg: 'User already exists'});
        }
        user = new User({ email, password, role});
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password,salt);
        await user.save();

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
            
        }
        jwt.sign(payload,process.env.jwtSecret, {
            expiresIn: '1d'
        }, (err, token) =>{
            if(err) throw err;
            res.json({token, role: user.role, userID: user.id })
        }
    )


    }catch(err){
        console.error(err.message)
        res.status(500).send('Server Error');

    }

    

    

}

//verify email
exports.verifyEmail = async (req, res) => {
    try {
        const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()});
    }
    const generateToken = async () => {
        const verifyToken = crypto.randomBytes(3).toString('hex').toUpperCase();
        const hashedToken = crypto
        .createHash('sha256')
        .update(verifyToken)
        .digest('hex')

        return { verifyToken, hashedToken};
    }
    
    

    const { email } = req.body;
    const user = await User.findOne({ email })
    
    if(!user){
        await new Promise(resolve => setTimeout(resolve,1000));
        return res.json({ msg: 'If a user with this email exits, a verification code will be sent'})
    }
    const { verifyToken, hashedToken } = await generateToken();
    user.verifyToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();
    

    
      const   html = `
         <div style="font-family: Arial, sans-serif; background-color: #f9fafc; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; border: 1px solid #e5e7eb;">
  <h2 style="color: #007AFF; text-align: center; margin-bottom: 10px;">Trackademy</h2>
  
  <p style="font-size: 16px; color: #333;">Hello,</p>
  <p style="font-size: 16px; color: #333;">
    Thank you for signing up to <strong>Trackademy</strong>.  
    To verify your email, please use the code below:
  </p>

  <div style="text-align: center; margin: 20px 0;">
    <h1 style="font-size: 28px; letter-spacing: 4px; color: #007AFF; margin: 0;">${verifyToken}</h1>
  </div>

  <p style="font-size: 14px; color: #555; text-align: center;">
    ⏳ This code will expire in <strong>1 hour</strong>.
  </p>

  <p style="font-size: 14px; color: #555;">
    If you didn’t request this code, you can safely ignore this email.
  </p>

  <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />

  <p style="font-size: 12px; color: #999; text-align: center;">
    &copy; ${new Date().getFullYear()} Trackademy. All rights reserved.
  </p>
</div>
        `
        await sendEmail({
      to: email,
      subject: 'Your Verification Code',
      html,
    });
    res.json({
        message: 'Verification code sent successfully',
        email: user.email
    })
        
    }  catch (err) {
    console.error("Email verification error:", err);
    return res.status(500).json({ error: "Something went wrong", details: err.message });
  }

}

//email confirmation 
exports.confirmEmailVerification = async (req, res) => {
    try{
          const { email, code } = req.body;
  const hashedToken = crypto.createHash('sha256').update(code).digest('hex');
  
  const user = await User.findOne({
    email,
    verifyToken: hashedToken,
    resetTokenExpiry: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ msg: 'Invalid or expired code' });

  user.verifyToken = undefined;
  user.resetTokenExpiry = undefined;
  user.isVerified = true; 
  await user.save();

  return res.json({ success: true, message: 'Email successfully verified' });
    }catch(err){
        console.error( err.message)
        res.status(500).json({ error: 'An error occurred while verifying your email'});
    }

}



//forgot Password 
exports.forgotPassword = async (req, res) => {
    try{
        const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()});
    }

    const generateResetToken = async () => {
        const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase();
        const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

        return { resetToken, hashedToken};
    }

   


    const { email } = req.body;
    const user = await User.findOne({ email })
    
    if(!user){
        await new Promise(resolve => setTimeout(resolve,1000));
        return res.json({ msg: 'If a user with this email exits, a verification code will be sent'})
    }
    const { resetToken, hashedToken } = await generateResetToken();
    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();
    
    await sendEmail({
        to: email,
        subject: 'Password Reset Verification Code',
        html: `
         <div style="font-family: Arial, sans-serif; background-color: #f9fafc; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; border: 1px solid #e5e7eb;">
  <h2 style="color: #FF3B30; text-align: center; margin-bottom: 10px;">Trackademy</h2>
  
  <p style="font-size: 16px; color: #333;">Hello,</p>
  <p style="font-size: 16px; color: #333;">
    We received a request to reset your password.  
    Please use the verification code below to proceed:
  </p>

  <div style="text-align: center; margin: 20px 0;">
    <h1 style="font-size: 28px; letter-spacing: 4px; color: #FF3B30; margin: 0;">${resetToken}</h1>
  </div>

  <p style="font-size: 14px; color: #555; text-align: center;">
    ⏳ This code will expire in <strong>1 hour</strong>.
  </p>

  <p style="font-size: 14px; color: #555;">
    If you did not request a password reset, please ignore this email.  
    Your account will remain secure.
  </p>

  <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />

  <p style="font-size: 12px; color: #999; text-align: center;">
    &copy; ${new Date().getFullYear()} Trackademy. All rights reserved.
  </p>
</div>

        `
    });
    res.json({
        message: 'Verification code sent successfully',
        email: user.email,
    })

    }catch(err){
        console.error(err.message)
        res.status(500).json({ Error : 'An error occurred while processing your request'})

    }

}

// reset password
exports.ResetPassword = async (req, res) => {
    try{
        const { email, token, newPassword} = req.body;
        if(!email || !token || !newPassword){
            return res.status(400).json({ error: 'All fields are required'})
        }

        const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

        const user = await User.findOne({
            email: email,
            resetToken: hashedToken,
            resetTokenExpiry: { $gt: Date.now()}
        });

        if(!user){
            return res.status(400).json({ error: 'Invalid or expired verification code'});
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        user.tokenVersion = (user.tokenVersion || 0) + 1;

        await user.save();

        res.json({
            success: true,
            message: 'Password reset Successful'
        });




    }catch(err){
        console.error('Reset password error' ,err);
        res.status(500).json({ error: 'An error occurred while resetting the password!'});

    }

}


//Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Add pagination, filtering, and sorting as needed
    const users = await User.find()
    

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false,
      msg: 'Server Error'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/user/:id
// @access  private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'user not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }
    res.status(500).json({ 
      success: false,
      msg: 'Server Error'
    });
  }
};



//unlock blocked users
exports.unlockUser = async (req, res) => {
  try {
    const { userId } = req.params;
   

    // Check if requester is admin (you need to add this check)
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Only admins can unlock user accounts' 
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Store previous lock state 
    const wasLocked = user.lockedManually || (user.lockUntil && user.lockUntil > new Date());

    user.lockedManually = false;
    user.lockLevel = 0;
    user.lockUntil = null;
    user.loginAttempts = 0;

    await user.save();
    await sendEmail({
      to: user.email,
      subject: 'Account Unlocked',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9fafc; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; border: 1px solid #e5e7eb;">
          <h2 style="color: #007AFF; text-align: center; margin-bottom: 10px;">Trackademy</h2>
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">
            Your account has been unlocked. You can now log in to your account.
          </p>
          <p style="font-size: 14px; color: #555;">
            If you have any questions or concerns, please contact our support team.
          </p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            &copy; ${new Date().getFullYear()} Trackademy. All rights reserved.
          </p>
        </div>
      `
    });


  

    res.json({ 
      success: true, 
      message: `User account ${user.email} unlocked successfully`,
      wasLocked 
    });
  } catch (error) {
    console.error('Error unlocking user:', error);
    res.status(500).json({ 
      success: false,
      error: 'An error occurred while unlocking the user account' 
    });
  }
};

//route to create user
exports.createUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if requester is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can create user accounts'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'User already exists' 
      });
    }

    // Create new user
    const user = new User({ email, password, role });
    const salt = await bcrypt.genSalt(10);  
    user.password = await bcrypt.hash(password, salt);
    user.isVerified = true;
    await user.save();

    // IMPROVED: Return created user data
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      success: false,
      error: 'An error occurred while creating the user' 
    });
  }
};

//delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params; 

    // Check if requester is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can delete user accounts'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete related records FIRST
    if (user.role === 'Student') {
      await Student.deleteOne({ user: id });
    } else if (user.role === 'Admin' || user.role === 'Instructor') {
      await Admin.deleteOne({ user: id });
    }

    // Then delete the user
    await User.findByIdAndDelete(id);

    // Send email (non-blocking, errors won't affect response)
    sendEmail({
      to: user.email,
      subject: 'Account Deleted',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9fafc; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; border: 1px solid #e5e7eb;">
          <h2 style="color: #007AFF; text-align: center; margin-bottom: 10px;">Trackademy</h2>
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">
            Your account has been deleted. If you have any questions or concerns, please contact our support team.
          </p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            &copy; ${new Date().getFullYear()} Trackademy. All rights reserved.
          </p>
        </div>
      `
    }).catch(err => console.error('Failed to send deletion email:', err));

    res.json({
      success: true,
      message: 'User deleted successfully',
      id: id
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while deleting the user'
    });
  }
};

//edit user
exports.editUser = async (req, res) => {
  try {
    const { id } = req.params; // Changed from userId to id to match route
    const { email, role } = req.body;

    // Check if requester is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can edit user accounts'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update fields
    if (email) user.email = email;
    if (role) user.role = role;
    await user.save();

    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while updating the user'
    });
  }
};