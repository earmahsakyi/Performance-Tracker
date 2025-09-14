import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { 
  MessageSquare, 
  ArrowLeft, 
  ThumbsUp, 
  MessageCircle, 
  Clock, 
  Pin, 
  TrendingUp,
  Loader2,
  Filter,
  Plus
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/student/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CreatePost from "./CreatePost"
import { getPostsByCategory } from "../../../actions/forumAction"
import toast from "react-hot-toast"

const CategoryPosts = () => {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [sortBy, setSortBy] = useState('recent')
  const [showCreatePost, setShowCreatePost] = useState(false)

  const { 
    posts, 
    postsLoading, 
    pagination, 
    categories,
    error 
  } = useSelector(state => state.forum)

  // Find current category
  const currentCategory = categories.find(cat => cat._id === categoryId)

  useEffect(() => {
    if (categoryId) {
      dispatch(getPostsByCategory(categoryId, { sort: sortBy }))
    }
  }, [dispatch, categoryId, sortBy])

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
  }

  const handlePostClick = (postId) => {
    navigate(`/forum/post/${postId}`)
  }

  const handleCreatePostSuccess = () => {
    dispatch(getPostsByCategory(categoryId, { sort: sortBy }))
    toast.success("Post created successfully!")
  }

  const getCategoryColor = (categoryName) => {
    switch (categoryName) {
      case "React Discussion": return "border-blue-500 text-blue-600"
      case "UI/UX Feedback": return "border-purple-500 text-purple-600"
      case "JavaScript Help": return "border-yellow-500 text-yellow-600"
      case "Career Advice": return "border-green-500 text-green-600"
      default: return "border-muted text-muted-foreground"
    }
  }

  if (postsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student/forum')}
              className="bg-gradient-accent hover:opacity-90"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forum
            </Button>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <MessageSquare className="h-8 w-8 text-primary" />
                {currentCategory?.name || 'Category Posts'}
              </h1>
              <p className="text-muted-foreground">
                {currentCategory?.description || 'Browse posts in this category'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="hot">Hot Topics</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                className="bg-gradient-primary hover:opacity-90"
                onClick={() => setShowCreatePost(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Post
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="p-4">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        {posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="bg-gradient-card shadow-card border-0 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handlePostClick(post._id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={post.authorDetails?.avatar || post.author?.avatar} 
                          alt={post.authorDetails?.name || post.author?.name} 
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {post.authorDetails?.name 
                            ? post.authorDetails.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                            : (post.author?.name || 'UN').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                          }
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
                                {post.title}
                              </h3>
                              {post.isPinned && (
                                <Pin className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                              {post.isHot && (
                                <TrendingUp className="h-4 w-4 text-warning flex-shrink-0" />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                              <span>by {post.authorDetails?.name || post.author?.name || 'Unknown'}</span>
                              <Badge variant="outline" className={getCategoryColor(post.categoryName || post.category?.name)}>
                                {post.categoryName || post.category?.name}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {post.content && (
                              <p className="text-muted-foreground line-clamp-2 mb-3">
                                {post.content.length > 150 
                                  ? `${post.content.substring(0, 150)}...` 
                                  : post.content
                                }
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{post.repliesCount || 0} replies</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{post.likesCount || 0} likes</span>
                            </div>
                            {post.viewsCount && (
                              <div className="flex items-center gap-1">
                                <span>{post.viewsCount} views</span>
                              </div>
                            )}
                          </div>

                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePostClick(post._id)
                            }}
                            className="hover:bg-accent"
                          >
                            View Discussion
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="bg-gradient-card shadow-card border-0">
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to start a discussion in this category!
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

        {/* Pagination would go here if needed */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              {/* Add pagination controls here */}
              <span className="text-sm text-muted-foreground">
                Page {pagination.current} of {pagination.pages}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePost 
        isOpen={showCreatePost} 
        onClose={() => setShowCreatePost(false)}
        onSuccess={handleCreatePostSuccess}
        defaultCategory={categoryId}
      />
    </DashboardLayout>
  )
}

export default CategoryPosts