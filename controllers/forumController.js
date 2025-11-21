const Post = require('../models/Post');
const ForumCategory = require('../models/ForumCategory');
const ForumComment = require('../models/ForumComment');
const Student = require('../models/Student');
const User = require('../models/User');

// Get forum dashboard data
exports.getForumDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get forum stats
    const [
      totalPosts,
      activeUsers,
      totalCategories,
      userPosts
    ] = await Promise.all([
      Post.countDocuments({ isDeleted: false }),
      User.countDocuments({ 
        lastSeen: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      }),
      ForumCategory.countDocuments({ isActive: true }),
      Post.countDocuments({ author: userId, isDeleted: false })
    ]);

    // Calculate questions answered (posts with replies)
    const questionsAnswered = await Post.countDocuments({
      isDeleted: false,
      repliesCount: { $gt: 0 }
    });

    const forumStats = [
      { label: "Total Posts", value: totalPosts, color: "text-primary" },
      { label: "Active Users", value: activeUsers, color: "text-success" },
      { label: "Questions Answered", value: questionsAnswered, color: "text-warning" },
      { label: "Your Posts", value: userPosts, color: "text-primary" },
    ];

    // Get forum categories with stats
    const categories = await ForumCategory.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .select('name description postsCount color icon');

    const forumCategories = categories.map(cat => ({
      id: cat._id,
      name: cat.name,
      description: cat.description,
      posts: cat.postsCount,
      color: cat.color,
      icon: cat.icon
    }));

    // Get trending topics
    const trendingPosts = await Post.find({ 
      isDeleted: false,
      $or: [
        { isPinned: true },
        { isHot: true },
        { likesCount: { $gte: 5 } },
        { repliesCount: { $gte: 3 } }
      ]
    })
    .populate('author', 'name email')
    .populate('category', 'name')
    .sort({ 
      isPinned: -1, 
      isHot: -1, 
      likesCount: -1, 
      lastActivity: -1 
    })
    .limit(10)
    .select('title author authorDetails category categoryName repliesCount likesCount lastReply isPinned isHot createdAt lastActivity');

    const trendingTopics = trendingPosts.map(post => ({
      title: post.title,
      author: post.authorDetails?.name || post.author?.name || 'Unknown',
      authorAvatar: getInitials(post.authorDetails?.name || post.author?.name || 'UN'),
      category: post.categoryName || post.category?.name || 'General',
      replies: post.repliesCount,
      likes: post.likesCount,
      lastReply: getTimeAgo(post.lastReply?.createdAt || post.createdAt),
      isPinned: post.isPinned,
      isHot: post.isHot,
      _id: post._id
    }));

    res.json({
      success: true,
      data: {
        forumStats,
        forumCategories,
        trendingTopics
      }
    });

  } catch (error) {
    console.error('Get forum dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forum dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await ForumCategory.find({ isActive: true })
      .sort({ sortOrder: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// Get posts by category
exports.getPostsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10, sort = 'recent' } = req.query;

    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { likesCount: -1, repliesCount: -1 };
        break;
      case 'hot':
        sortOptions = { isHot: -1, lastActivity: -1 };
        break;
      case 'recent':
      default:
        sortOptions = { isPinned: -1, lastActivity: -1, createdAt: -1 };
    }

    const posts = await Post.find({ 
      category: categoryId, 
      isDeleted: false 
    })
    .populate('author', 'name email')
    .populate('category', 'name')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const totalPosts = await Post.countDocuments({ 
      category: categoryId, 
      isDeleted: false 
    });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: page,
          pages: Math.ceil(totalPosts / limit),
          total: totalPosts
        }
      }
    });
  } catch (error) {
    console.error('Get posts by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
};

// Create new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, categoryId, tags, relatedCourse } = req.body;
    const userId = req.user.id;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get student details for name
    const student = await Student.findOne({ userId });
    const authorName = student?.name || user.email.split('@')[0];

    // Verify category exists
    const category = await ForumCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const post = new Post({
      title,
      content,
      author: userId,
      authorDetails: {
        name: authorName,
        avatar: student?.photo || '',
        role: user.role
      },
      category: categoryId,
      categoryName: category.name,
      tags: tags || [],
      relatedCourse: relatedCourse || undefined
    });

    await post.save();

    // Update category post count
    await ForumCategory.findByIdAndUpdate(
      categoryId,
      { $inc: { postsCount: 1 } }
    );

    // Populate for response
    await post.populate('author', 'name email');
    await post.populate('category', 'name');

    res.status(201).json({
      success: true,
      data: post,
      message: 'Post created successfully'
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single post with comments
exports.getPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate('author', 'name email')
      .populate('category', 'name')
      .populate('relatedCourse', 'title code');

    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    await post.incrementViews();

    // Get comments
    const comments = await ForumComment.find({ 
      post: postId, 
      isDeleted: false,
      parentComment: null // Only top-level comments
    })
    .populate('author', 'name email')
    .populate({
      path: 'replies',
      match: { isDeleted: false },
      populate: { path: 'author', select: 'name email' }
    })
    .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        post,
        comments
      }
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post'
    });
  }
};

// Toggle like on post
exports.togglePostLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.toggleLike(userId);

    res.json({
      success: true,
      data: {
        likesCount: post.likesCount,
        isLiked: post.likes.some(like => like.user.toString() === userId)
      }
    });

  } catch (error) {
    console.error('Toggle post like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
};

// Add comment to post
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Get user details
    const user = await User.findById(userId);
    const student = await Student.findOne({ userId });
    const authorName = student?.name || user.email.split('@')[0];

    const comment = new ForumComment({
      content,
      author: userId,
      authorDetails: {
        name: authorName,
        avatar: student?.photo || '',
        role: user.role
      },
      post: postId,
      parentComment: parentCommentId || undefined 
    });

    await comment.save();

    // Update post reply count and last activity
    await Post.findByIdAndUpdate(postId, {
      $inc: { repliesCount: 1 },
      lastReply: {
        user: userId,
        userName: authorName,
        createdAt: new Date()
      },
      lastActivity: new Date()
    });

    await comment.populate('author', 'name email');

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully'
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
};

// Search posts
exports.searchPosts = async (req, res) => {
  try {
    const { q, category, sort = 'relevance', page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    let searchQuery = {
      $text: { $search: q },
      isDeleted: false
    };

    if (category && category !== 'all') {
      searchQuery.category = category;
    }

    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { score: { $meta: 'textScore' }, likesCount: -1 };
        break;
      case 'recent':
        sortOptions = { score: { $meta: 'textScore' }, createdAt: -1 };
        break;
      case 'relevance':
      default:
        sortOptions = { score: { $meta: 'textScore' } };
    }

    const posts = await Post.find(searchQuery, { score: { $meta: 'textScore' } })
      .populate('author', 'name email')
      .populate('category', 'name')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalPosts = await Post.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(totalPosts / limit),
          total: totalPosts
        },
        query: q
      }
    });

  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search posts'
    });
  }
};

// Helper functions
function getInitials(name) {
  if (!name) return 'UN';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function getTimeAgo(date) {
  if (!date) return 'Unknown';
  
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
}

