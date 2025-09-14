import React, { useState } from "react"
import { motion } from "framer-motion"
import { Heart, Reply, MoreVertical, Flag, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDispatch } from "react-redux"
import { addComment } from "../../../actions/forumAction"
import toast from "react-hot-toast"

const Comment = ({ 
  comment, 
  postId, 
  isReply = false, 
  onReply, 
  currentUserId 
}) => {
  const dispatch = useDispatch()
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0)

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

  const handleReplySubmit = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return

    try {
      await dispatch(addComment(postId, {
        content: replyText,
        parentCommentId: comment._id
      }))
      setReplyText("")
      setIsReplying(false)
      toast.success("Reply added successfully!")
    } catch (error) {
      console.error('Failed to add reply:', error)
    }
  }

  const handleLike = () => {
    // Toggle like state (you'd typically dispatch an action here)
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
    // TODO: Implement actual like toggle API call
  }

  const isOwner = comment.author?._id === currentUserId || 
                  comment.authorDetails?.userId === currentUserId

  return (
    <motion.div
      initial={{ opacity: 0, x: isReply ? -10 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start gap-3 ${isReply ? 'ml-8' : ''}`}
    >
      <Avatar className={isReply ? "h-8 w-8" : "h-10 w-10"}>
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
        <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${isReply ? 'text-sm' : 'text-base'}`}>
                {comment.authorDetails?.name || 'Unknown'}
              </span>
              <span className={`text-muted-foreground ${isReply ? 'text-xs' : 'text-sm'}`}>
                {formatTimeAgo(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {isOwner ? (
                  <>
                    <DropdownMenuItem className="text-sm">
                      Edit Comment
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm text-destructive">
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem className="text-sm">
                    <Flag className="h-3 w-3 mr-2" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <p className={`text-foreground whitespace-pre-wrap leading-relaxed ${
            isReply ? 'text-sm' : 'text-base'
          }`}>
            {comment.content}
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`h-7 px-2 text-xs ${isLiked ? 'text-red-600' : 'text-muted-foreground'}`}
          >
            <Heart className={`h-3 w-3 mr-1 ${isLiked ? 'fill-current' : ''}`} />
            {likesCount > 0 && likesCount}
          </Button>
          
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying(!isReplying)}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleReplySubmit}
            className="mt-3 ml-4"
          >
            <div className="space-y-3">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[80px] resize-none text-sm"
              />
              <div className="flex items-center gap-2">
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={!replyText.trim()}
                  className="h-8 px-3 text-xs"
                >
                  Reply
                </Button>
                <Button 
                  type="button" 
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(false)}
                  className="h-8 px-3 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.form>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <Comment
                key={reply._id}
                comment={reply}
                postId={postId}
                isReply={true}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default Comment