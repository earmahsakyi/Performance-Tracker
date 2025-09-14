const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  authorDetails: {
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: { type: String, default: 'Student' }
  },
  
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ForumCategory", 
    required: true 
  },
  categoryName: { type: String }, // Denormalized for quick access
  
  // Post status
  isPinned: { type: Boolean, default: false },
  isHot: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  
  // Engagement metrics
  likes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
  }],
  likesCount: { type: Number, default: 0 },
  
  views: { type: Number, default: 0 },
  repliesCount: { type: Number, default: 0 },
  
  // Last activity tracking
  lastReply: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: String,
    createdAt: Date
  },
  lastActivity: { type: Date, default: Date.now },
  
  // Tags for better searchability
  tags: [String],
  
  // For moderation
  reportCount: { type: Number, default: 0 },
  reports: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, enum: ["spam", "inappropriate", "harassment", "other"] },
    description: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Course relation (optional - for course-specific posts)
  relatedCourse: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Course" 
  },
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comments
postSchema.virtual('comments', {
  ref: 'ForumComment',
  localField: '_id',
  foreignField: 'post'
});

// Indexes for better performance
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ isPinned: -1, lastActivity: -1 });
postSchema.index({ isHot: -1, likesCount: -1 });
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Methods
postSchema.methods.toggleLike = function(userId) {
  const existingLike = this.likes.find(like => 
    like.user.toString() === userId.toString()
  );
  
  if (existingLike) {
    this.likes = this.likes.filter(like => 
      like.user.toString() !== userId.toString()
    );
    this.likesCount = Math.max(0, this.likesCount - 1);
  } else {
    this.likes.push({ user: userId });
    this.likesCount += 1;
  }
  
  return this.save();
};

postSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

postSchema.methods.updateLastActivity = function(userId, userName) {
  this.lastReply = {
    user: userId,
    userName: userName,
    createdAt: new Date()
  };
  this.lastActivity = new Date();
  return this.save();
};

// Auto-update hot status based on activity
postSchema.pre('save', function(next) {
  const now = new Date();
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
  
  // Mark as hot if recent activity and good engagement
  if (this.lastActivity > dayAgo && 
      (this.likesCount >= 10 || this.repliesCount >= 5)) {
    this.isHot = true;
  } else if (this.lastActivity < dayAgo) {
    this.isHot = false;
  }
  
  next();
});

module.exports = mongoose.model("Post", postSchema);