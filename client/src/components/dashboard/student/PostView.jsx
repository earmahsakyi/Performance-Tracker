import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MessageSquare, 
  ArrowLeft, 
  ThumbsUp, 
  MessageCircle, 
  Clock, 
  Pin, 
  TrendingUp,
  Loader2,
  Send,
  Reply,
  Heart,
  Share2,
  Bookmark,
  Eye
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/student/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { 
  getPost, 
  togglePostLike, 
  addComment, 
  clearCurrentPost 
} from "../../../actions/forumAction"
import toast from "react-hot-toast"

const PostView = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [commentText, setCommentText] = useState("")
  const [replyingTo, setReplyingTo] = useState(null)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  const { 
    currentPost, 
    currentComments, 
    postLoading, 
    error 
  } = useSelector(state => state.forum)

  useEffect(() => {
    if (postId) {
      dispatch(getPost(postId))
    }
    
    return () => {
      dispatch(clearCurrentPost())
    }
  }, [dispatch, postId])

  const handleLike = async () => {
    if (isLiking || !currentPost) return
    
    setIsLiking(true)
    try {
      await dispatch(togglePostLike(postId))
    } catch (error) {
      console.error('Failed to toggle like:', error)
    } finally {
      setIsLiking(false)
    }
  }

 const handleCommentSubmit = async (e) => {
  e.preventDefault()
  if (!commentText.trim()) return

  try {
    // Prepare the comment data object
    const commentData = {
      content: commentText.trim()
    }
    
    // Only add parentCommentId if we're actually replying to a comment
    // and it's a valid ObjectId (not null or empty string)
    if (replyingTo && replyingTo.trim() && /^[0-9a-fA-F]{24}$/.test(replyingTo.trim())) {
      commentData.parentCommentId = replyingTo.trim()
    }

    await dispatch(addComment(postId, commentData))
    setCommentText("")
    setReplyingTo(null)
    toast.success("Comment added successfully!")
  } catch (error) {
    console.error('Failed to add comment:', error)
  }
}

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
      setShowShareMenu(false)
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const getCategoryColor = (categoryName) => {
    switch (categoryName) {
      case "React Discussion": return "border-blue-500 text-blue-600 bg-blue-50"
      case "UI/UX Feedback": return "border-purple-500 text-purple-600 bg-purple-50"
      case "JavaScript Help": return "border-yellow-500 text-yellow-600 bg-yellow-50"
      case "Career Advice": return "border-green-500 text-green-600 bg-green-50"
      default: return "border-muted text-muted-foreground bg-muted/20"
    }
  }

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown'
    
    const now = new Date()
    const diffMs = now - new Date(date)
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
  }

  if (postLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading post...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !currentPost) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-16 w-16 text-destructive/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-destructive mb-2">Post Not Found</h3>
              <p className="text-destructive/80 mb-4">
                {error || "The post you're looking for doesn't exist or has been removed."}
              </p>
              <Button onClick={() => navigate('/student/forum')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Forum
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="bg-gradient-accent hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Main Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-card shadow-card border-0">
            <CardContent className="p-6">
              {/* Post Header */}
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={currentPost.authorDetails?.avatar} 
                    alt={currentPost.authorDetails?.name} 
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {currentPost.authorDetails?.name 
                      ? currentPost.authorDetails.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                      : 'UN'
                    }
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold line-clamp-2">{currentPost.title}</h1>
                    {currentPost.isPinned && (
                      <Pin className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                    {currentPost.isHot && (
                      <TrendingUp className="h-5 w-5 text-warning flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                    <span>by {currentPost.authorDetails?.name || 'Unknown'}</span>
                    <Badge variant="outline" className={getCategoryColor(currentPost.categoryName)}>
                      {currentPost.categoryName}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(currentPost.createdAt)}</span>
                    </div>
                    {currentPost.viewsCount && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{currentPost.viewsCount} views</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="relative"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  {showShareMenu && (
                    <div className="absolute right-0 top-12 z-50 bg-background border rounded-lg shadow-lg p-2 min-w-[120px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShare}
                        className="w-full justify-start"
                      >
                        Copy Link
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {currentPost.content}
                </p>
              </div>

              {/* Tags */}
              {currentPost.tags && currentPost.tags.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  {currentPost.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-muted/20">
                <div className="flex items-center gap-4">
                  <Button
                    variant={currentPost.isLikedByUser ? "default" : "ghost"}
                    size="sm"
                    onClick={handleLike}
                    disabled={isLiking}
                    className="flex items-center gap-2"
                  >
                    {isLiking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ThumbsUp className={`h-4 w-4 ${currentPost.isLikedByUser ? 'fill-current' : ''}`} />
                    )}
                    <span>{currentPost.likesCount || 0}</span>
                  </Button>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>{currentPost.repliesCount || 0} replies</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Comments Section */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments ({currentComments?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="space-y-3">
                {replyingTo && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Reply className="h-4 w-4" />
                    <span>Replying to comment</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(null)}
                      className="h-6 px-2 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                
                <Textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!commentText.trim()}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </div>
            </form>

            <Separator className="my-6" />

            {/* Comments List */}
            <div className="space-y-6">
              <AnimatePresence>
                {currentComments && currentComments.length > 0 ? (
                  currentComments.map((comment, index) => (
                    <motion.div
                      key={comment._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={comment.authorDetails?.avatar} 
                          alt={comment.authorDetails?.name} 
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                          {comment.authorDetails?.name 
                            ? comment.authorDetails.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                            : 'UN'
                          }
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">
                            {comment.authorDetails?.name || 'Unknown'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(comment._id)}
                            className="h-7 px-2 text-xs"
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            {comment.likesCount || 0}
                          </Button>
                        </div>
                        
                        {/* Nested replies would go here */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 pl-4 border-l-2 border-muted space-y-4">
                            {comment.replies.map((reply) => (
                              <div key={reply._id} className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                    {reply.authorDetails?.name 
                                      ? reply.authorDetails.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                                      : 'UN'
                                    }
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-xs">
                                      {reply.authorDetails?.name || 'Unknown'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatTimeAgo(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-foreground whitespace-pre-wrap">
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                    <div className="text-center py-12">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        No comments yet
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Be the first to share your thoughts!
                      </p>
                    </div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Related Posts (Optional) */}
        {currentPost.relatedCourse && (
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5" />
                Related to Course
              </CardTitle>
              <CardDescription>
                This discussion is related to a specific course
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                <div className="flex-1">
                  <h4 className="font-semibold">{currentPost.relatedCourse}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Explore more discussions related to this course
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Course
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State for Comments */}
        {postLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Loading comments...</span>
          </div>
        )}

        {/* Error State for Comments */}
        {error && (
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="p-4 text-center">
              <p className="text-destructive text-sm">
                Failed to load comments. Please try again.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(getPost(postId))}
                className="mt-2"
              >
                <Loader2 className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          className="rounded-full w-14 h-14 bg-gradient-primary shadow-lg"
          onClick={() => {
            const commentInput = document.querySelector('textarea')
            if (commentInput) {
              commentInput.focus()
              window.scrollTo({
                top: commentInput.offsetTop - 100,
                behavior: 'smooth'
              })
            }
          }}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </DashboardLayout>
  )
}

export default PostView