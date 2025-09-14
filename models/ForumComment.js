 const mongoose = require("mongoose");

const forumCommentSchema = new mongoose.Schema({
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
  
  post: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Post", 
    required: true 
  },
  
  // For nested replies
  parentComment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ForumComment" 
  },
  
  // Engagement
  likes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
  }],
  likesCount: { type: Number, default: 0 },
  
  // Status
  isDeleted: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  editedAt: Date,
  
  // For moderation
  reportCount: { type: Number, default: 0 },
  reports: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, enum: ["spam", "inappropriate", "harassment", "other"] },
    description: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for nested replies
forumCommentSchema.virtual('replies', {
  ref: 'ForumComment',
  localField: '_id',
  foreignField: 'parentComment'
});

// Indexes
forumCommentSchema.index({ post: 1, createdAt: 1 });
forumCommentSchema.index({ author: 1 });
forumCommentSchema.index({ parentComment: 1 });

// Methods
forumCommentSchema.methods.toggleLike = function(userId) {
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

module.exports = mongoose.model("ForumComment", forumCommentSchema);