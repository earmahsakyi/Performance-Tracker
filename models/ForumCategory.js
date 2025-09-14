const mongoose = require("mongoose");

const forumCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  
  // Visual customization
  color: { type: String, default: "bg-blue-500" },
  icon: { type: String, default: "MessageSquare" },
  
  // Category stats (updated periodically)
  postsCount: { type: Number, default: 0 },
  totalReplies: { type: Number, default: 0 },
  
  // Category settings
  isActive: { type: Boolean, default: true },
  requiresModeration: { type: Boolean, default: false },
  allowStudentPosts: { type: Boolean, default: true },
  
  // Moderators for this category
  moderators: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  
  // Display order
  sortOrder: { type: Number, default: 0 },
  
}, { timestamps: true });

// Index for better performance
forumCategorySchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("ForumCategory", forumCategorySchema);

