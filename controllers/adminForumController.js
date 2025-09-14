const Post = require('../models/Post');
const ForumCategory = require('../models/ForumCategory');
const ForumComment = require('../models/ForumComment');
const Student = require('../models/Student');
const User = require('../models/User');

// Category Management
exports.createCategory = async (req, res) => {
  try {
    const { name, description, color, icon, requiresModeration, allowStudentPosts } = req.body;

    // Create slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const category = new ForumCategory({
      name,
      description,
      slug,
      color: color || 'bg-blue-500',
      icon: icon || 'MessageSquare',
      requiresModeration: requiresModeration || false,
      allowStudentPosts: allowStudentPosts !== false
    });

    await category.save();

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }

    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const updates = req.body;

    // If name is being updated, update slug too
    if (updates.name) {
      updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    const category = await ForumCategory.findByIdAndUpdate(
      categoryId,
      updates,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await ForumCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has posts
    const postsCount = await Post.countDocuments({ category: categoryId, isDeleted: false });
    
    if (postsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing posts. Please move or delete posts first.'
      });
    }

    await ForumCategory.findByIdAndDelete(categoryId);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

// Post Moderation
exports.togglePinPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({
      success: true,
      data: { isPinned: post.isPinned },
      message: `Post ${post.isPinned ? 'pinned' : 'unpinned'} successfully`
    });

  } catch (error) {
    console.error('Toggle pin post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle pin status'
    });
  }
};

exports.toggleLockPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.isLocked = !post.isLocked;
    await post.save();

    res.json({
      success: true,
      data: { isLocked: post.isLocked },
      message: `Post ${post.isLocked ? 'locked' : 'unlocked'} successfully`
    });

  } catch (error) {
    console.error('Toggle lock post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle lock status'
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.isDeleted = true;
    await post.save();

    // Update category post count
    await ForumCategory.findByIdAndUpdate(
      post.category,
      { $inc: { postsCount: -1 } }
    );

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
};

// Analytics
exports.getForumAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) } };
        break;
    }

    const [
      totalPosts,
      totalComments,
      totalUsers,
      newPosts,
      newComments,
      newUsers,
      topCategories,
      topPosters,
      engagementMetrics
    ] = await Promise.all([
      Post.countDocuments({ isDeleted: false }),
      ForumComment.countDocuments({ isDeleted: false }),
      User.countDocuments(),
      Post.countDocuments({ ...dateFilter, isDeleted: false }),
      ForumComment.countDocuments({ ...dateFilter, isDeleted: false }),
      User.countDocuments(dateFilter),
      
      // Top categories by post count
      Post.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$categoryName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      
      // Top posters
      Post.aggregate([
        { $match: { ...dateFilter, isDeleted: false } },
        { $group: { _id: '$author', count: { $sum: 1 }, name: { $first: '$authorDetails.name' } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Engagement metrics
      Post.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: null,
            avgLikes: { $avg: '$likesCount' },
            avgReplies: { $avg: '$repliesCount' },
            totalViews: { $sum: '$views' }
          }
        }
      ])
    ]);

    const analytics = {
      overview: {
        totalPosts,
        totalComments,
        totalUsers,
        newPosts,
        newComments,
        newUsers
      },
      topCategories: topCategories.map(cat => ({
        name: cat._id,
        posts: cat.count
      })),
      topPosters: topPosters.map(poster => ({
        name: poster.name || 'Unknown',
        posts: poster.count
      })),
      engagement: engagementMetrics[0] || {
        avgLikes: 0,
        avgReplies: 0,
        totalViews: 0
      }
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get forum analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};