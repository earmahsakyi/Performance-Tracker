const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
   email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Student', 'Admin'],
        default: 'Student',
   
        
    },
     profileUpdated: {
        type: Boolean,
        default: false
    },
    isVerified : {
        type: Boolean,
        default: false
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    blockedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    resetToken : String,
    verifyToken: String,
    resetTokenExpiry: Date,
    tokenVersion: {
        type: Number,
        default: 0
    },
     
  

},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
     }
);

// Index for better search performance
userSchema.index({ username: 'text', email: 'text' });


module.exports = mongoose.model('User', userSchema);
