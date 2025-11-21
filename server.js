const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const User = require('./models/User');
const GroupChat = require('./models/GroupChat');
const StudyGroup = require('./models/StudyGroup');
const helmet = require('helmet');
const { apiLimiter } = require('./middleware/rateLimiter');
const getClientIp = require('./middleware/getClientIp');
const path = require("path");


const app = express();

// Connect database
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: [
        "'self'", 
        "data:", 
        "https://ui-avatars.com",
        "https://*.amazonaws.com",
        "https://s3.amazonaws.com",
        "https://*.s3.amazonaws.com",
        "https://trackademy.s3.eu-north-1.amazonaws.com/admin/",
        "https://trackademy.s3.eu-north-1.amazonaws.com/student/",
        "https://trackademy.s3.amazonaws.com",
      ],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Trust proxy - IMPORTANT for getting real IP addresses behind reverse proxies/load balancers
app.set('trust proxy', 1);

// CORS
app.use(cors());

// Body parser
app.use(express.json({ extended: false }));

// Extract client IP for all routes
app.use(getClientIp);

// Apply general rate limiting to all API routes
app.use('/api/', apiLimiter);

// Root route
app.get('/', (req, res) => res.json({ msg: 'Welcome to Local Service API...' }));

const server = http.createServer(app);

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/courses', require('./routes/course'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/admin/forum', require('./routes/adminForum'));
app.use('/api/study-groups', require('./routes/studyGroup'));
app.use('/api/certificates', require('./routes/certificate'));
app.use('/api/announcements', require('./routes/announcement'));
app.use('/api/deadlines', require('./routes/deadline'));

// Serve frontend build (important for Railway deployment)
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// For all other routes (non-API), return React index.html (for React Router)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});


// Setup Socket.io with authentication
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store active connections
const activeUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId
const typingUsers = new Map(); // groupId -> Map(userId -> Set of users they're typing to)
const groupRooms = new Map(); // groupId -> Set of socketIds

// Socket middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.jwtSecret);
    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.email} (${socket.id})`);

  // Store user connection
  const userId = socket.user._id.toString();
  activeUsers.set(userId, socket.id);
  userSockets.set(socket.id, userId);

  // Join user to their own room
  socket.join(userId);

  // Update user online status
  User.findByIdAndUpdate(userId, {
    isOnline: true,
    lastSeen: new Date()
  }).catch((err) => console.error('Error updating user status:', err));

  // Notify about user coming online
  socket.emit('user_online', socket.user._id);
  socket.broadcast.emit('user_connected', socket.user._id);

  // Send list of online users to everyone
  const onlineUserIds = Array.from(activeUsers.keys());
  io.emit('online_users', onlineUserIds);

  // ==================== GROUP CHAT EVENTS ====================

  // Join a group chat room
  socket.on('join_group_chat', async ({ groupId }) => {
    try {
      // Verify user is a member of the group
      const group = await StudyGroup.findById(groupId);
      if (!group) {
        socket.emit('error', { message: 'Group not found' });
        return;
      }

      const userRole = group.getMemberRole(userId);
      if (!userRole) {
        socket.emit('error', { message: 'Must be a group member to access chat' });
        return;
      }

      // Join the group room
      socket.join(`group_${groupId}`);

      // Track group room membership
      if (!groupRooms.has(groupId)) {
        groupRooms.set(groupId, new Set());
      }
      groupRooms.get(groupId).add(socket.id);

      console.log(`User ${socket.user.email} joined group chat ${groupId}`);

      // Notify other group members that user joined
      socket.to(`group_${groupId}`).emit('user_joined_group_chat', {
        userId: socket.user._id,
        groupId,
        timestamp: new Date()
      });

      socket.emit('joined_group_chat', { groupId });
    } catch (error) {
      console.error('Error joining group chat:', error);
      socket.emit('error', { message: 'Failed to join group chat' });
    }
  });

  // Leave a group chat room
  socket.on('leave_group_chat', ({ groupId }) => {
    try {
      socket.leave(`group_${groupId}`);

      // Remove from group room tracking
      if (groupRooms.has(groupId)) {
        groupRooms.get(groupId).delete(socket.id);
        if (groupRooms.get(groupId).size === 0) {
          groupRooms.delete(groupId);
        }
      }

      // Clear typing status for this group
      if (typingUsers.has(groupId) && typingUsers.get(groupId).has(userId)) {
        typingUsers.get(groupId).delete(userId);
        if (typingUsers.get(groupId).size === 0) {
          typingUsers.delete(groupId);
        }

        // Notify group that user stopped typing
        socket.to(`group_${groupId}`).emit('group_typing', {
          groupId,
          userId: socket.user._id,
          isTyping: false
        });
      }

      console.log(`User ${socket.user.email} left group chat ${groupId}`);

      // Notify other group members that user left
      socket.to(`group_${groupId}`).emit('user_left_group_chat', {
        userId: socket.user._id,
        groupId,
        timestamp: new Date()
      });

      socket.emit('left_group_chat', { groupId });
    } catch (error) {
      console.error('Error leaving group chat:', error);
      socket.emit('error', { message: 'Failed to leave group chat' });
    }
  });

  // Send group message
  socket.on('send_group_message', async (data) => {
    try {
      const { groupId, content, messageType = 'text', replyTo, mentions } = data;

      // Verify user is a member of the group
      const group = await StudyGroup.findById(groupId);
      if (!group) {
        socket.emit('error', { message: 'Group not found' });
        return;
      }

      const userRole = group.getMemberRole(userId);
      if (!userRole) {
        socket.emit('error', { message: 'Must be a group member to send messages' });
        return;
      }

      // Get or create group chat
      let chat = await GroupChat.findOne({ groupId });
      if (!chat) {
        chat = new GroupChat({ groupId });
      }

      // Add message to chat
      const newMessage = chat.addMessage(userId, content, messageType);

      if (replyTo) {
        newMessage.replyTo = replyTo;
      }

      if (mentions && Array.isArray(mentions)) {
        newMessage.mentions = mentions;
      }

      await chat.save();

      // Update group activity
      await group.updateActivity();

      // Populate sender info
      await chat.populate('messages.sender', 'email');
      const populatedMessage = chat.messages[chat.messages.length - 1];

      // Create message object to broadcast
      const messageData = {
        _id: populatedMessage._id,
        groupId,
        sender: {
          _id: populatedMessage.sender._id,
          email: populatedMessage.sender.email
        },
        content: populatedMessage.content,
        messageType: populatedMessage.messageType,
        timestamp: populatedMessage.timestamp,
        replyTo: populatedMessage.replyTo,
        mentions: populatedMessage.mentions,
        reactions: populatedMessage.reactions,
        isEdited: populatedMessage.isEdited,
        editedAt: populatedMessage.editedAt
      };

      // Send to all users in the group room
      io.to(`group_${groupId}`).emit('new_group_message', messageData);

      // Send mentions notifications to mentioned users
      if (mentions && mentions.length > 0) {
        mentions.forEach((mentionedUserId) => {
          const mentionedUserSocket = activeUsers.get(mentionedUserId.toString());
          if (mentionedUserSocket) {
            io.to(mentionedUserSocket).emit('group_mention', {
              groupId,
              messageId: populatedMessage._id,
              mentionedBy: socket.user._id,
              content: content.substring(0, 100) // First 100 chars
            });
          }
        });
      }

      console.log(`Group message sent by ${socket.user.email} to group ${groupId}`);
    } catch (error) {
      console.error('Error sending group message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Group typing indicators
  socket.on('group_typing', ({ groupId, isTyping }) => {
    try {
      // Track typing status
      if (!typingUsers.has(groupId)) {
        typingUsers.set(groupId, new Map());
      }

      const groupTyping = typingUsers.get(groupId);

      if (isTyping) {
        groupTyping.set(userId, Date.now());

        // Auto-clear typing after 3 seconds
        setTimeout(() => {
          if (groupTyping.has(userId)) {
            groupTyping.delete(userId);
            if (groupTyping.size === 0) {
              typingUsers.delete(groupId);
            }

            // Notify group that user stopped typing
            socket.to(`group_${groupId}`).emit('group_typing', {
              groupId,
              userId: socket.user._id,
              isTyping: false
            });
          }
        }, 3000);
      } else {
        groupTyping.delete(userId);
        if (groupTyping.size === 0) {
          typingUsers.delete(groupId);
        }
      }

      // Notify other group members about typing status
      socket.to(`group_${groupId}`).emit('group_typing', {
        groupId,
        userId: socket.user._id,
        isTyping
      });
    } catch (error) {
      console.error('Error handling group typing:', error);
    }
  });

  // Edit group message
  socket.on('edit_group_message', async ({ groupId, messageId, content }) => {
    try {
      const chat = await GroupChat.findOne({ groupId });
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      const edited = chat.editMessage(messageId, userId, content);
      if (!edited) {
        socket.emit('error', { message: 'Cannot edit this message' });
        return;
      }

      await chat.save();

      // Notify all group members about message edit
      io.to(`group_${groupId}`).emit('group_message_edited', {
        groupId,
        messageId,
        content,
        editedAt: new Date(),
        editedBy: socket.user._id
      });

      console.log(`Group message ${messageId} edited by ${socket.user.email}`);
    } catch (error) {
      console.error('Error editing group message:', error);
      socket.emit('error', { message: 'Failed to edit message' });
    }
  });

  // Delete group message
  socket.on('delete_group_message', async ({ groupId, messageId }) => {
    try {
      const chat = await GroupChat.findOne({ groupId });
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      const deleted = chat.deleteMessage(messageId, userId);
      if (!deleted) {
        socket.emit('error', { message: 'Cannot delete this message' });
        return;
      }

      await chat.save();

      // Notify all group members about message deletion
      io.to(`group_${groupId}`).emit('group_message_deleted', {
        groupId,
        messageId,
        deletedBy: socket.user._id,
        deletedAt: new Date()
      });

      console.log(`Group message ${messageId} deleted by ${socket.user.email}`);
    } catch (error) {
      console.error('Error deleting group message:', error);
      socket.emit('error', { message: 'Failed to delete message' });
    }
  });

  // Add reaction to group message
  socket.on('add_group_reaction', async ({ groupId, messageId, emoji }) => {
    try {
      const chat = await GroupChat.findOne({ groupId });
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      const reacted = chat.addReaction(messageId, userId, emoji);
      if (!reacted) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      await chat.save();

      // Get updated reactions for this message
      const message = chat.messages.id(messageId);
      const reactions = message.reactions;

      // Notify all group members about reaction
      io.to(`group_${groupId}`).emit('group_reaction_updated', {
        groupId,
        messageId,
        reactions,
        userId: socket.user._id,
        emoji
      });

      console.log(`Reaction ${emoji} added to message ${messageId} by ${socket.user.email}`);
    } catch (error) {
      console.error('Error adding group reaction:', error);
      socket.emit('error', { message: 'Failed to add reaction' });
    }
  });

  // Mark group messages as read
  socket.on('mark_group_messages_read', async ({ groupId, messageIds }) => {
    try {
      const chat = await GroupChat.findOne({ groupId });
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      if (Array.isArray(messageIds)) {
        messageIds.forEach((messageId) => {
          chat.markMessageRead(messageId, userId);
        });
      }

      await chat.save();

      // Notify group about read receipts
      socket.to(`group_${groupId}`).emit('group_messages_read', {
        groupId,
        messageIds,
        readBy: socket.user._id,
        readAt: new Date()
      });

      console.log(`${messageIds?.length || 0} messages marked as read by ${socket.user.email} in group ${groupId}`);
    } catch (error) {
      console.error('Error marking group messages as read:', error);
      socket.emit('error', { message: 'Failed to mark messages as read' });
    }
  });

  // Get group online members
  socket.on('get_group_online_members', ({ groupId }) => {
    try {
      const groupSocketIds = groupRooms.get(groupId);
      if (groupSocketIds) {
        const onlineMembers = Array.from(groupSocketIds)
          .map((socketId) => userSockets.get(socketId))
          .filter(Boolean);

        socket.emit('group_online_members', {
          groupId,
          onlineMembers
        });
      } else {
        socket.emit('group_online_members', {
          groupId,
          onlineMembers: []
        });
      }
    } catch (error) {
      console.error('Error getting group online members:', error);
      socket.emit('error', { message: 'Failed to get online members' });
    }
  });

  // Handle disconnect with improved cleanup
  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.user?.email || socket.id} - Reason: ${reason}`);

    const disconnectedUserId = userSockets.get(socket.id);
    if (disconnectedUserId) {
      // Update user offline status
      User.findByIdAndUpdate(disconnectedUserId, {
        isOnline: false,
        lastSeen: new Date()
      }).catch((err) => console.error('Error updating user status:', err));

      // Clear all group typing statuses for this user
      typingUsers.forEach((groupTyping, groupId) => {
        if (groupTyping.has(disconnectedUserId)) {
          groupTyping.delete(disconnectedUserId);
          if (groupTyping.size === 0) {
            typingUsers.delete(groupId);
          }

          // Notify group that user stopped typing
          socket.to(`group_${groupId}`).emit('group_typing', {
            groupId,
            userId: disconnectedUserId,
            isTyping: false
          });
        }
      });

      // Remove from all group rooms
      groupRooms.forEach((socketIds, groupId) => {
        if (socketIds.has(socket.id)) {
          socketIds.delete(socket.id);
          if (socketIds.size === 0) {
            groupRooms.delete(groupId);
          }

          // Notify group members that user left
          socket.to(`group_${groupId}`).emit('user_left_group_chat', {
            userId: disconnectedUserId,
            groupId,
            timestamp: new Date()
          });
        }
      });

      activeUsers.delete(disconnectedUserId);
      userSockets.delete(socket.id);
      socket.broadcast.emit('user_disconnected', disconnectedUserId);

      // Update online users list
      const onlineUserIds = Array.from(activeUsers.keys());
      io.emit('online_users', onlineUserIds);
    }
  });

  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.log('Connection error:', error);
  });

  // Handle reconnection
  socket.on('reconnect', () => {
    console.log(`User reconnected: ${socket.user.email}`);
    const userId = socket.user._id.toString();
    activeUsers.set(userId, socket.id);
    userSockets.set(socket.id, userId);

    // Update user online status
    User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date()
    }).catch((err) => console.error('Error updating user status:', err));

    socket.broadcast.emit('user_connected', socket.user._id);
    const onlineUserIds = Array.from(activeUsers.keys());
    io.emit('online_users', onlineUserIds);
  });
});

// Cleanup function for graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  // Clear all active connections
  activeUsers.clear();
  userSockets.clear();
  typingUsers.clear();
  groupRooms.clear();

  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Socket.io server ready for connections`);
  console.log(`👥 Group chat features: Real-time messaging, typing indicators, reactions, mentions`);
  console.log(`🛡️  Security: Rate limiting, IP tracking, and logging enabled`);
});