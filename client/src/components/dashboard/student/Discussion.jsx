import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MessageCircle, Plus, Heart, Clock, Send } from 'lucide-react';
import { postApi } from '@/lib/api';
import { Post, Comment } from '@/types';
import toast from 'react-hot-toast';

export default function Discussion() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [commentInputs, setCommentInputs] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await postApi.getAllPosts();
      setPosts(response.data);
    } catch (error) {
      toast.error('Failed to load discussion posts');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await postApi.createPost(newPost);
      toast.success('Post created successfully!');
      setNewPost({ title: '', content: '' });
      setNewPostOpen(false);
      fetchPosts();
    } catch (error) {
      toast.error('Failed to create post');
      console.error('Error:', error);
    }
  };

  const addComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content?.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await postApi.addComment(postId, content);
      toast.success('Comment added!');
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchPosts();
    } catch (error) {
      toast.error('Failed to add comment');
      console.error('Error:', error);
    }
  };

  const likePost = async (postId) => {
    try {
      await postApi.likePost(postId);
      fetchPosts();
    } catch (error) {
      toast.error('Failed to like post');
      console.error('Error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date().getTime();
    const postTime = new Date(dateString).getTime();
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 bg-muted animate-pulse rounded w-1/3" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Discussion Forum</h1>
          <p className="text-muted-foreground mt-2">
            Connect with fellow students and share knowledge
          </p>
        </div>
        
        <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
              <DialogDescription>
                Share your thoughts, ask questions, or start a discussion
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter post title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your post content..."
                  rows={5}
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewPostOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createPost}>
                  Create Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post._id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>
                      {post.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>by {post.author.name}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getTimeAgo(post.createdAt)}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => likePost(post._id)}
                    className="flex items-center gap-2"
                  >
                    <Heart className={`h-4 w-4 ${post.likes.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                    {post.likes.length}
                  </Button>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {post.comments.length} comments
                  </Badge>
                </div>

                {post.comments.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-medium">Comments</h4>
                      {post.comments.map((comment) => (
                        <div key={comment._id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author.avatar} />
                            <AvatarFallback className="text-xs">
                              {comment.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{comment.author.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Separator />
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Write a comment..."
                    value={commentInputs[post._id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addComment(post._id)}
                  />
                  <Button onClick={() => addComment(post._id)} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No discussions yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to start a conversation!
            </p>
            <Button onClick={() => setNewPostOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Post
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}