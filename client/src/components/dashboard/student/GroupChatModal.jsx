import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Smile, Paperclip, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { createSelector } from 'reselect';
import { getChatMessages } from '../../../actions/groupChatAction';
import useGroupSocket from '../../../hooks/useSocket';
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

// Memoized selectors to prevent unnecessary re-renders
const selectChatData = createSelector(
  [(state, groupId) => state.studyGroup.chatMessages[groupId]],
  (chatData) => ({
    messages: chatData?.messages || []
  })
);

const selectGroupChatState = createSelector(
  [state => state.studyGroup.groupChat],
  (groupChat) => ({
    connected: groupChat?.connected || {},
    typing: groupChat?.typing || {},
    onlineMembers: groupChat?.onlineMembers || {}
  })
);

const selectTypingUsers = createSelector(
  [(state, groupId) => state.studyGroup.groupChat?.typing?.[groupId], (state) => state.auth.user?._id],
  (typingUsersObj = {}, userId) => {
    return Object.entries(typingUsersObj)
      .filter(([uid, isTyping]) => isTyping && uid !== userId)
      .map(([uid]) => `User ${uid.substring(0, 8)}`);
  }
);

// Memoized message component with better optimization
const Message = memo(({ message, user, onEdit, onDelete, onReact }) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isOwnMessage = useMemo(() => message.sender._id === user._id, [message.sender._id, user._id]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditContent(message.content);
  }, [message.content]);

  const handleSaveEdit = useCallback(() => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message._id, editContent.trim());
    }
    setIsEditing(false);
  }, [editContent, message.content, message._id, onEdit]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent(message.content);
  }, [message.content]);

  const handleDelete = useCallback(() => {
    onDelete(message._id);
  }, [message._id, onDelete]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  // Memoize formatted timestamp
  const formattedTime = useMemo(() => 
    new Date(message.timestamp).toLocaleTimeString(),
    [message.timestamp]
  );

  // Memoize user initials
  const userInitials = useMemo(() => 
    message.sender.email.substring(0, 2).toUpperCase(),
    [message.sender.email]
  );

  return (
    <div 
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`relative max-w-xs lg:max-w-md p-3 rounded-lg ${
        isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{message.sender.email}</span>
          {message.isEdited && (
            <span className="text-xs opacity-60">(edited)</span>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>Save</Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="text-sm">{message.content}</p>
        )}
        
        <div className="text-xs opacity-70 mt-1">
          {formattedTime}
        </div>

        {/* Message reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {message.reactions.map((reaction, index) => (
              <span
                key={`${reaction.emoji}-${index}`}
                className="text-xs bg-background/10 px-1 py-0.5 rounded cursor-pointer hover:bg-background/20"
                onClick={() => onReact(message._id, reaction.emoji)}
              >
                {reaction.emoji} {reaction.count || 1}
              </span>
            ))}
          </div>
        )}

        {/* Message actions */}
        {showActions && isOwnMessage && !isEditing && (
          <div className="absolute -right-2 top-2 bg-background border rounded shadow-sm p-1 flex gap-1">
            <Button
              size="sm"
              className="h-6 w-6 p-0 bg-accent hover:bg-green-900"
              onClick={handleEdit}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              className="h-6 w-6 p-0 bg-red-800 hover:bg-red-950"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better optimization
  return (
    prevProps.message._id === nextProps.message._id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.isEdited === nextProps.message.isEdited &&
    prevProps.message.reactions?.length === nextProps.message.reactions?.length &&
    prevProps.user._id === nextProps.user._id
  );
});

Message.displayName = 'Message';

// Typing indicator component with better optimization
const TypingIndicator = memo(({ typingUsers }) => {
  if (!typingUsers || typingUsers.length === 0) return null;

  const typingText = useMemo(() => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing...`;
    }
    return `${typingUsers.slice(0, -1).join(', ')} and ${typingUsers[typingUsers.length - 1]} are typing...`;
  }, [typingUsers]);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground p-3">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
        <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
      </div>
      <span>{typingText}</span>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.typingUsers.length === nextProps.typingUsers.length &&
         prevProps.typingUsers.every((user, index) => user === nextProps.typingUsers[index]);
});

TypingIndicator.displayName = 'TypingIndicator';

const GroupChatModal = memo(({ groupId, open, onClose }) => {
  const dispatch = useDispatch();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Use memoized selectors
  const chatData = useSelector(state => selectChatData(state, groupId), shallowEqual);
  const user = useSelector(state => state.auth.user, shallowEqual);
  const error = useSelector(state => state.studyGroup.error);
  const loading = useSelector(state => state.studyGroup.loading?.chatMessages);
  
  const groupChatState = useSelector(selectGroupChatState, shallowEqual);
  const typingUsers = useSelector(state => selectTypingUsers(state, groupId));

  // Memoized derived values
  const isConnected = useMemo(() => groupChatState.connected[groupId] || false, [groupChatState.connected, groupId]);
  const onlineMembers = useMemo(() => groupChatState.onlineMembers[groupId] || [], [groupChatState.onlineMembers, groupId]);

  const { 
    joinGroupChat, 
    leaveGroupChat, 
    sendGroupMessage,
    editGroupMessage,
    deleteGroupMessage,
    addGroupReaction,
    setGroupTypingStatus,
    markGroupMessagesRead
  } = useGroupSocket();

  const [newMessage, setNewMessage] = useState('');
  const [typingTimer, setTypingTimer] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Handle group chat connection
  useEffect(() => {
    if (open && groupId) {
      console.log('GroupChatModal opening for group:', groupId);
      dispatch(getChatMessages(groupId));
      joinGroupChat(groupId);
    }

    return () => {
      if (groupId) {
        leaveGroupChat(groupId);
      }
    };
  }, [open, groupId, dispatch, joinGroupChat, leaveGroupChat]);

  // Handle errors with cleanup
  useEffect(() => {
    if (error) {
      toast.error(error);
      // Dispatch a specific clear error action instead of generic one
      dispatch({ type: 'CLEAR_STUDY_GROUP_ERROR' });
    }
  }, [error, dispatch]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatData.messages.length]); // Only depend on length, not the entire array

  // Mark messages as read when modal opens or new messages arrive
  useEffect(() => {
    if (open && groupId && chatData.messages.length > 0 && user?._id) {
      const unreadMessages = chatData.messages
        .filter(msg => !msg.readBy?.some(read => read.userId === user._id))
        .map(msg => msg._id);
      
      if (unreadMessages.length > 0) {
        markGroupMessagesRead(groupId, unreadMessages);
      }
    }
  }, [open, groupId, chatData.messages.length, user?._id, markGroupMessagesRead]);

  // Optimized typing handlers with cleanup
  const handleTypingStart = useCallback(() => {
    if (!groupId) return;
    
    setGroupTypingStatus(groupId, true);
    
    if (typingTimer) {
      clearTimeout(typingTimer);
    }
    
    const timer = setTimeout(() => {
      setGroupTypingStatus(groupId, false);
    }, 1000);
    
    setTypingTimer(timer);
  }, [groupId, setGroupTypingStatus, typingTimer]);

  const handleTypingStop = useCallback(() => {
    if (typingTimer) {
      clearTimeout(typingTimer);
      setTypingTimer(null);
    }
    if (groupId) {
      setGroupTypingStatus(groupId, false);
    }
  }, [groupId, setGroupTypingStatus, typingTimer]);

  // Cleanup typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimer) {
        clearTimeout(typingTimer);
      }
    };
  }, [typingTimer]);

  // Handle message input changes
  const handleMessageChange = useCallback((e) => {
    setNewMessage(e.target.value);
    handleTypingStart();
  }, [handleTypingStart]);

  // Send message
  const handleSendMessage = useCallback(() => {
    const trimmedMessage = newMessage.trim();
    if (trimmedMessage && groupId) {
      sendGroupMessage(groupId, {
        content: trimmedMessage,
        messageType: 'text'
      });
      setNewMessage('');
      handleTypingStop();
    }
  }, [newMessage, groupId, sendGroupMessage, handleTypingStop]);

  // Handle key press in message input
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Memoized message action handlers
  const handleEditMessage = useCallback((messageId, content) => {
    if (groupId) {
      editGroupMessage(groupId, messageId, content);
    }
  }, [groupId, editGroupMessage]);

  const handleDeleteMessage = useCallback((messageId) => {
    if (groupId && window.confirm('Are you sure you want to delete this message?')) {
      deleteGroupMessage(groupId, messageId);
    }
  }, [groupId, deleteGroupMessage]);

  const handleAddReaction = useCallback((messageId, emoji) => {
    if (groupId) {
      addGroupReaction(groupId, messageId, emoji);
    }
  }, [groupId, addGroupReaction]);

  // Memoized status text
  const connectionStatusText = useMemo(() => {
    const parts = [isConnected ? 'Connected' : 'Disconnected'];
    if (onlineMembers.length > 0) {
      parts.push(`${onlineMembers.length} online`);
    }
    return parts.join(' • ');
  }, [isConnected, onlineMembers.length]);

  // Early return if not open
  if (!open) return null;

  const handleEmojiClick = (emojiData) => {
  setNewMessage((prev) => prev + emojiData.emoji);
  setShowEmojiPicker(false); // close after selecting
};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Group Chat</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{connectionStatusText}</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            This is the chat for your study group.
          </DialogDescription>
        </DialogHeader>

        {/* Connection status */}
        {!isConnected && (
          <div className="text-center text-red-500 py-2 text-sm">
            Connecting to chat server...
          </div>
        )}

        {/* Messages area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto space-y-4 mb-4 px-2"
        >
          {loading && chatData.messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Loading messages...
            </div>
          ) : chatData.messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            chatData.messages.map((message) => (
              <Message 
                key={message._id} 
                message={message} 
                user={user}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                onReact={handleAddReaction}
              />
            ))
          )}
          
          {/* Typing indicator */}
          <TypingIndicator typingUsers={typingUsers} />
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="flex items-center gap-2">
          <Button
              variant="outline"
              size="icon"
              disabled={!isConnected}
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            >
              <Smile className="h-4 w-4" />
            </Button>

            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          <Input
            value={newMessage}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            onBlur={handleTypingStop}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!isConnected}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim() || !isConnected}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

GroupChatModal.displayName = 'GroupChatModal';

export default GroupChatModal;