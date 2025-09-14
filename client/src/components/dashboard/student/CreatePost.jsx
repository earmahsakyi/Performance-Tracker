import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Tag, BookOpen, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"
import { createPost, getCategories } from "../../../actions/forumAction"

const CreatePost = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const { categories } = useSelector(state => state.forum)
  
  const [formData, setFormData] = useState({
    title: "",
    content: "", 
    categoryId: "",
    tags: [],
    relatedCourse: ""
  })
  
  const [tagInput, setTagInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load categories if not already loaded
  useEffect(() => {
    if (isOpen && categories.length === 0) {
      dispatch(getCategories())
    }
  }, [isOpen, categories.length, dispatch])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error("Please enter a title")
      return
    }
    
    if (!formData.content.trim()) {
      toast.error("Please enter content")
      return
    }
    
    if (!formData.categoryId) {
      toast.error("Please select a category")
      return
    }

    setIsSubmitting(true)
    
    try {
      await dispatch(createPost({
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: formData.categoryId,
        tags: formData.tags,
        relatedCourse: formData.relatedCourse.trim() || undefined
      }))
      
      // Reset form
      setFormData({
        title: "",
        content: "",
        categoryId: "",
        tags: [],
        relatedCourse: ""
      })
      setTagInput("")
      
      onSuccess && onSuccess()
      onClose()
      
    } catch (error) {
      // Error is handled in the action
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-gradient-card shadow-xl border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl">Create New Post</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="What's your question or topic?"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="bg-muted/50"
                        maxLength={200}
                      />
                      <div className="text-xs text-muted-foreground text-right">
                        {formData.title.length}/200
                      </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => handleInputChange("categoryId", value)}
                      >
                        <SelectTrigger className="bg-muted/50">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        placeholder="Share your thoughts, ask your question, or start a discussion..."
                        value={formData.content}
                        onChange={(e) => handleInputChange("content", e.target.value)}
                        className="bg-muted/50 min-h-[150px] resize-y"
                        maxLength={5000}
                      />
                      <div className="text-xs text-muted-foreground text-right">
                        {formData.content.length}/5000
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <Label>Tags (Optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={handleTagInputKeyPress}
                          className="bg-muted/50 flex-1"
                          maxLength={20}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddTag}
                          disabled={!tagInput.trim() || formData.tags.length >= 5}
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              {tag}
                              <X className="h-3 w-3 ml-1" />
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        {formData.tags.length}/5 tags
                      </div>
                    </div>

                    {/* Related Course */}
                    <div className="space-y-2">
                      <Label htmlFor="relatedCourse">Related Course (Optional)</Label>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="relatedCourse"
                          placeholder="e.g., React Fundamentals, JavaScript ES6..."
                          value={formData.relatedCourse}
                          onChange={(e) => handleInputChange("relatedCourse", e.target.value)}
                          className="bg-muted/50 pl-10"
                          maxLength={100}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-primary hover:opacity-90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Create Post
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CreatePost