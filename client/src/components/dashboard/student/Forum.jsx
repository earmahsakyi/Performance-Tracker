import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { MessageSquare, Search, Plus, ThumbsUp, MessageCircle, Pin, TrendingUp, Clock, Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/student/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import CreatePost from "./CreatePost"
import toast from "react-hot-toast"
import { 
  getForumDashboard, 
  getCategories, 
  searchPosts, 
  setSearchQuery, 
  clearSearchResults 
} from "../../../actions/forumAction";
import { useNavigate } from "react-router-dom"

const Forum = () => {
  const dispatch = useDispatch()
  const [searchInput, setSearchInput] = useState("")
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true) 
  const navigate = useNavigate();

  // Redux state
  const {
    forumStats,
    forumCategories,
    trendingTopics,
    searchResults,
    searchQuery,
    loading,
    searchLoading,
    error
  } = useSelector(state => state.forum)

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoad(true)
      try {
        await Promise.all([
          dispatch(getForumDashboard()),
          dispatch(getCategories())
        ])
      } finally {
        setIsInitialLoad(false)
      }
    }
    
    loadInitialData()
  }, [dispatch])

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchInput.trim().length >= 2) {
      dispatch(setSearchQuery(searchInput))
      dispatch(searchPosts(searchInput))
    } else if (searchInput.trim().length === 0) {
      dispatch(clearSearchResults())
    }
  }

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value)
    if (e.target.value === "") {
      dispatch(clearSearchResults())
    }
  }

  // Category color mapping
  const getCategoryColor = (category) => {
    switch (category) {
      case "React Discussion": return "border-blue-500 text-blue-600"
      case "UI/UX Feedback": return "border-purple-500 text-purple-600"
      case "JavaScript Help": return "border-yellow-500 text-yellow-600"
      case "Career Advice": return "border-green-500 text-green-600"
      default: return "border-muted text-muted-foreground"
    }
  }

  const handleCategoryClick = (categoryId) => {
    navigate(`/forum/category/${categoryId}`)
  }

  const handleTopicClick = (topicId) => {
    navigate(`/forum/post/${topicId}`)
  }

  const handleSearchResultClick = (postId) => {
    navigate(`/forum/post/${postId}`)
  }

  const handleCreatePostSuccess = () => {
    dispatch(getForumDashboard())
    toast.success("Post created successfully!")
  }

  // Show loading state during initial load
  if (isInitialLoad || (loading && (!forumStats.length && !forumCategories.length))) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading forum data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Check if we have any data to show
  const hasData = forumStats.length > 0 || forumCategories.length > 0 || trendingTopics.length > 0
  const showEmptyState = !isInitialLoad && !loading && !hasData

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-primary" />
              Study Forum
            </h1>
            <p className="text-muted-foreground">
              Connect with peers, ask questions, and share knowledge
            </p>
          </div>
          <Button 
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
            onClick={() => setShowCreatePost(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="p-4">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Forum Stats */}
        {forumStats.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {forumStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-card shadow-card border-0">
                  <CardContent className="p-6 text-center">
                    <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Search */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search forum posts, topics, or users..."
                  className="pl-10 bg-muted/50 border-0"
                  value={searchInput}
                  onChange={handleSearchInputChange}
                />
                {searchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                Found {searchResults.length} results for "{searchQuery}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchResults.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleSearchResultClick(post._id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.authorDetails?.avatar} alt={post.authorDetails?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {post.authorDetails?.name ? post.authorDetails.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'UN'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold line-clamp-1">{post.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              by {post.authorDetails?.name || post.author?.name || 'Unknown'}
                            </span>
                            <Badge variant="outline" className={getCategoryColor(post.categoryName)}>
                              {post.categoryName || post.category?.name}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.repliesCount || 0} replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{post.likesCount || 0} likes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Forum Categories */}
        {forumCategories.length > 0 && (
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle>Forum Categories</CardTitle>
              <CardDescription>
                Browse discussions by topic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {forumCategories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleCategoryClick(category.id || category._id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${category.color || 'bg-blue-500'} text-white`}>
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          {category.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {category.posts || category.postsCount || 0} posts
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trending Discussions */}
        {trendingTopics.length > 0 && (
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-warning" />
                Trending Discussions
              </CardTitle>
              <CardDescription>
                Popular and recent forum topics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingTopics.map((topic, index) => (
                  <motion.div
                    key={topic._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleTopicClick(topic._id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={topic.author} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {topic.authorAvatar}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold line-clamp-1">{topic.title}</h3>
                            {topic.isPinned && (
                              <Pin className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                            {topic.isHot && (
                              <TrendingUp className="h-4 w-4 text-warning flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">by {topic.author}</span>
                            <Badge variant="outline" className={getCategoryColor(topic.category)}>
                              {topic.category}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{topic.replies} replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{topic.likes} likes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Last reply {topic.lastReply}</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTopicClick(topic._id)
                      }}
                    >
                      View Discussion
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State - Only show when we're sure there's no data */}
        {showEmptyState && (
          <Card className="bg-gradient-card shadow-card border-0">
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Welcome to the Forum</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to start a discussion and help build our learning community!
              </p>
              <Button 
                className="bg-gradient-primary hover:opacity-90"
                onClick={() => setShowCreatePost(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePost 
        isOpen={showCreatePost} 
        onClose={() => setShowCreatePost(false)}
        onSuccess={handleCreatePostSuccess}
      />
    </DashboardLayout>
  )
}

export default Forum