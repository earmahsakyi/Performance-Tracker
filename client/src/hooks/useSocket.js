import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import io from 'socket.io-client';
import {
  addGroupMessage,
  updateGroupMessage,
  removeGroupMessage,
  setGroupTyping,
  clearGroupTyping,
  setGroupOnlineMembers,
  addGroupOnlineMember,
  removeGroupOnlineMember,
  updateGroupMessageReactions,
  updateGroupMessageReadStatus,
  addGroupMention,
  setGroupChatConnected,
  setGroupChatError,
  loadConversations,
  loadMessages,
  addMessage,
  messageSent,
  setTyping,
  clearTyping,
  updateOnlineUsers,
  userConnected,
  userDisconnected,
  chatError
} from '../actions/groupChatAction';

const useGroupSocket = () => {
  const dispatch = useDispatch();
  
  // Use stable selectors to prevent unnecessary reconnections
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);
  
  const socketRef = useRef(null);
  const connectedGroups = useRef(new Set());
  const typingTimeouts = useRef(new Map());
  const reconnectAttempts = useRef(0);
  const isConnecting = useRef(false);
  const eventListenersSetup = useRef(false);

  // Memoized socket configuration
  const socketConfig = useMemo(() => ({
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
    timeout: 20000,
    forceNew: true // Force new connection to prevent reuse issues
  }), [token]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (socketRef.current) {
      console.log('Cleaning up socket connection...');
      
      // Clear all timeouts
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.current.clear();
      
      // Leave all groups
      connectedGroups.current.forEach(groupId => {
        if (socketRef.current?.connected) {
          socketRef.current.emit('leave_group_chat', { groupId });
        }
      });
      
      // Emit offline status if connected
      if (socketRef.current.connected && user?._id) {
        socketRef.current.emit('user_offline', user._id);
      }
      
      // Remove all listeners and disconnect
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      
      // Reset state
      connectedGroups.current.clear();
      eventListenersSetup.current = false;
      isConnecting.current = false;
      reconnectAttempts.current = 0;
    }
  }, [user?._id]);

  // Setup event listeners (memoized to prevent recreation)
  const setupEventListeners = useCallback((socket) => {
    if (eventListenersSetup.current) {
      return;
    }

    console.log('Setting up socket event listeners...');

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      isConnecting.current = false;
      reconnectAttempts.current = 0;
      
      if (user?._id) {
        socket.emit('user_online', user._id);
        
        // Rejoin previously connected groups
        connectedGroups.current.forEach(groupId => {
          socket.emit('join_group_chat', { groupId });
        });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      isConnecting.current = false;
      
      // Update connection status for all groups
      connectedGroups.current.forEach(groupId => {
        dispatch(setGroupChatConnected(groupId, false));
      });

      if (reason === 'io server disconnect') {
        // Server disconnected the socket, need to reconnect manually
        setTimeout(() => {
          if (user && token && !isConnecting.current) {
            connect();
          }
        }, 1000);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      isConnecting.current = false;
      reconnectAttempts.current += 1;
      
      let errorMessage = 'Connection failed. ';
      if (error.message?.includes('Authentication')) {
        errorMessage += 'Please refresh the page and try again.';
      } else if (reconnectAttempts.current >= 5) {
        errorMessage += 'Unable to connect to server. Please check your internet connection.';
      } else {
        errorMessage += 'Retrying...';
      }
      
      dispatch(setGroupChatError(errorMessage));

      // Exponential backoff for reconnection
      if (reconnectAttempts.current < 5) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
        setTimeout(() => {
          if (user && token && !socket.connected) {
            connect();
          }
        }, delay);
      }
    });

    // Group chat events
    socket.on('joined_group_chat', ({ groupId }) => {
      console.log(`Joined group chat: ${groupId}`);
      dispatch(setGroupChatConnected(groupId, true));
      connectedGroups.current.add(groupId);
    });

    socket.on('left_group_chat', ({ groupId }) => {
      console.log(`Left group chat: ${groupId}`);
      dispatch(setGroupChatConnected(groupId, false));
      connectedGroups.current.delete(groupId);
    });

    socket.on('user_joined_group_chat', ({ userId, groupId }) => {
      dispatch(addGroupOnlineMember(groupId, userId));
    });

    socket.on('user_left_group_chat', ({ userId, groupId }) => {
      dispatch(removeGroupOnlineMember(groupId, userId));
      dispatch(clearGroupTyping(groupId, userId));
    });

    socket.on('new_group_message', (messageData) => {
      dispatch(addGroupMessage(messageData.groupId, messageData));
      dispatch(clearGroupTyping(messageData.groupId, messageData.sender._id));
    });

    socket.on('group_message_edited', ({ groupId, messageId, content, editedAt, editedBy }) => {
      dispatch(updateGroupMessage(groupId, messageId, {
        content,
        isEdited: true,
        editedAt,
        editedBy
      }));
    });

    socket.on('group_message_deleted', ({ groupId, messageId, deletedBy, deletedAt }) => {
      dispatch(updateGroupMessage(groupId, messageId, {
        isDeleted: true,
        deletedBy,
        deletedAt
      }));
    });

    socket.on('group_typing', ({ groupId, userId, isTyping }) => {
      if (userId !== user?._id) {
        if (isTyping) {
          dispatch(setGroupTyping(groupId, userId, true));
          const timeoutKey = `${groupId}_${userId}`;
          
          // Clear existing timeout
          if (typingTimeouts.current.has(timeoutKey)) {
            clearTimeout(typingTimeouts.current.get(timeoutKey));
          }
          
          // Set new timeout
          const timeout = setTimeout(() => {
            dispatch(clearGroupTyping(groupId, userId));
            typingTimeouts.current.delete(timeoutKey);
          }, 3000);
          
          typingTimeouts.current.set(timeoutKey, timeout);
        } else {
          dispatch(clearGroupTyping(groupId, userId));
          const timeoutKey = `${groupId}_${userId}`;
          if (typingTimeouts.current.has(timeoutKey)) {
            clearTimeout(typingTimeouts.current.get(timeoutKey));
            typingTimeouts.current.delete(timeoutKey);
          }
        }
      }
    });

    socket.on('group_reaction_updated', ({ groupId, messageId, reactions }) => {
      dispatch(updateGroupMessageReactions(groupId, messageId, reactions));
    });

    socket.on('group_messages_read', ({ groupId, messageIds, readBy, readAt }) => {
      dispatch(updateGroupMessageReadStatus(groupId, messageIds, readBy, readAt));
    });

    socket.on('group_mention', (mentionData) => {
      dispatch(addGroupMention(mentionData));
    });

    socket.on('group_online_members', ({ groupId, onlineMembers }) => {
      dispatch(setGroupOnlineMembers(groupId, onlineMembers));
    });

    // Private chat events
    socket.on('receive_message', (messageData) => {
      dispatch(addMessage(messageData));
    });

    socket.on('message_sent', (messageData) => {
      dispatch(messageSent(messageData));
    });

    socket.on('message_error', (error) => {
      dispatch(chatError(error.error));
    });

    socket.on('typing', ({ userId, isTyping }) => {
      if (isTyping) {
        dispatch(setTyping(userId));
      } else {
        dispatch(clearTyping(userId));
      }
    });

    socket.on('conversations_loaded', (conversations) => {
      dispatch(loadConversations(conversations));
    });

    socket.on('messages_loaded', ({ messages, hasMore }) => {
      dispatch(loadMessages(messages, hasMore));
    });

    socket.on('conversations_error', (error) => {
      dispatch(chatError(error.error));
    });

    socket.on('messages_error', (error) => {
      dispatch(chatError(error.error));
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      dispatch(chatError(error.message || 'An error occurred'));
    });

    eventListenersSetup.current = true;
  }, [dispatch, user?._id]);

  // Connect function
  const connect = useCallback(() => {
    if (!user || !token || isConnecting.current) {
      return;
    }

    if (socketRef.current?.connected) {
      console.log('Socket already connected');
      return;
    }

    console.log('Establishing socket connection...');
    isConnecting.current = true;

    try {
      // Clean up existing connection
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      }

      // Create new socket connection
      socketRef.current = io('http://localhost:5000', socketConfig);
      setupEventListeners(socketRef.current);

      // Get conversations after connection
      const checkConnectionAndLoad = () => {
        if (socketRef.current?.connected) {
          socketRef.current.emit('get_conversations');
        } else {
          setTimeout(checkConnectionAndLoad, 100);
        }
      };
      
      setTimeout(checkConnectionAndLoad, 500);

    } catch (error) {
      console.error('Failed to create socket connection:', error);
      isConnecting.current = false;
      dispatch(setGroupChatError('Failed to connect to chat server'));
    }
  }, [user, token, socketConfig, setupEventListeners, dispatch]);

  // Main effect for connection management
  useEffect(() => {
    if (user && token) {
      connect();
    } else {
      cleanup();
    }

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user && token) {
        if (!socketRef.current?.connected && !isConnecting.current) {
          connect();
        }
      }
    };

    // Handle browser beforeunload
    const handleBeforeUnload = () => {
      if (socketRef.current?.connected && user?._id) {
        socketRef.current.emit('user_offline', user._id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanup();
    };
  }, [user, token, connect, cleanup]);

  // Memoized callback functions to prevent recreation on every render
  const joinGroupChat = useCallback((groupId) => {
    if (!groupId) return;
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_group_chat', { groupId });
      console.log(`Requesting to join group chat: ${groupId}`);
    } else {
      console.warn('Cannot join group chat - socket not connected');
      // Store for later connection
      connectedGroups.current.add(groupId);
      
      // Try to reconnect if not connecting
      if (!isConnecting.current) {
        connect();
      }
    }
  }, [connect]);

  const leaveGroupChat = useCallback((groupId) => {
    if (!groupId) return;
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_group_chat', { groupId });
      console.log(`Leaving group chat: ${groupId}`);
    }
    connectedGroups.current.delete(groupId);
  }, []);

  const sendGroupMessage = useCallback((groupId, messageData) => {
    if (!groupId || !messageData) return;
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_group_message', {
        groupId,
        ...messageData
      });
    } else {
      console.warn('Cannot send message - socket not connected');
      dispatch(chatError('Not connected to chat server'));
    }
  }, [dispatch]);

  const editGroupMessage = useCallback((groupId, messageId, content) => {
    if (!groupId || !messageId || !content) return;
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('edit_group_message', {
        groupId,
        messageId,
        content
      });
    } else {
      dispatch(chatError('Not connected to chat server'));
    }
  }, [dispatch]);

  const deleteGroupMessage = useCallback((groupId, messageId) => {
    if (!groupId || !messageId) return;
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('delete_group_message', {
        groupId,
        messageId
      });
    } else {
      dispatch(chatError('Not connected to chat server'));
    }
  }, [dispatch]);

  const addGroupReaction = useCallback((groupId, messageId, emoji) => {
    if (!groupId || !messageId || !emoji) return;
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('add_group_reaction', {
        groupId,
        messageId,
        emoji
      });
    } else {
      dispatch(chatError('Not connected to chat server'));
    }
  }, [dispatch]);

  const markGroupMessagesRead = useCallback((groupId, messageIds) => {
    if (!groupId || !messageIds?.length) return;
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_group_messages_read', {
        groupId,
        messageIds
      });
    }
  }, []);

  const setGroupTypingStatus = useCallback((groupId, isTyping) => {
    if (!groupId || typeof isTyping !== 'boolean') return;
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('group_typing', {
        groupId,
        isTyping
      });
    }
  }, []);

  const getGroupOnlineMembers = useCallback((groupId) => {
    if (!groupId) return;
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('get_group_online_members', { groupId });
    }
  }, []);

  const sendMessage = useCallback((receiver, content) => {
    if (!receiver || !content) return;
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', {
        receiver,
        content
      });
    } else {
      dispatch(chatError('Not connected to chat server'));
    }
  }, [dispatch]);

  const setTypingStatus = useCallback((receiverId, isTyping) => {
    if (!receiverId || typeof isTyping !== 'boolean') return;
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', {
        receiverId,
        isTyping
      });
    }
  }, []);

  const markMessagesRead = useCallback((senderId) => {
    if (!senderId) return;
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_messages_read', {
        senderId
      });
    }
  }, []);

  const getConversations = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('get_conversations');
    } else if (!isConnecting.current) {
      connect();
    }
  }, [connect]);

  const getMessages = useCallback((userId, page = 1, limit = 50) => {
    if (!userId) return;
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('get_messages', {
        userId,
        page,
        limit
      });
    } else {
      dispatch(chatError('Not connected to chat server'));
    }
  }, [dispatch]);

  // Force reconnection function
  const forceReconnect = useCallback(() => {
    console.log('Force reconnecting socket...');
    cleanup();
    setTimeout(() => {
      if (user && token) {
        connect();
      }
    }, 100);
  }, [cleanup, connect, user, token]);

  // Return memoized object to prevent unnecessary re-renders
  return useMemo(() => ({
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    isConnecting: isConnecting.current,
    joinGroupChat,
    leaveGroupChat,
    sendGroupMessage,
    editGroupMessage,
    deleteGroupMessage,
    addGroupReaction,
    markGroupMessagesRead,
    setGroupTypingStatus,
    getGroupOnlineMembers,
    sendMessage,
    setTypingStatus,
    markMessagesRead,
    getConversations,
    getMessages,
    forceReconnect
  }), [
    joinGroupChat,
    leaveGroupChat,
    sendGroupMessage,
    editGroupMessage,
    deleteGroupMessage,
    addGroupReaction,
    markGroupMessagesRead,
    setGroupTypingStatus,
    getGroupOnlineMembers,
    sendMessage,
    setTypingStatus,
    markMessagesRead,
    getConversations,
    getMessages,
    forceReconnect
  ]);
};

export default useGroupSocket;