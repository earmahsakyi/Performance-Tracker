const GroupChat = require('../models/GroupChat');
const StudyGroup = require('../models/StudyGroup'); 

const groupChatController = {
  // Get group chat messages
  getChatMessages: async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Verify user is a member of the group
    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const userRole = group.getMemberRole(userId);
    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'Must be a group member to access chat'
      });
    }

    const chat = await GroupChat.findOne({ groupId })
      .populate('messages.sender', 'email')
      .populate('messages.mentions', 'email');

    if (!chat) {
      // Create chat if it doesn't exist
      const newChat = new GroupChat({ groupId });
      await newChat.save();
      
      return res.json({
        success: true,
        data: {
          messages: [],
          hasMore: false
        }
      });
    }

    // Get messages (excluding deleted ones for regular users)
    let messages = chat.messages
      .filter(msg => !msg.isDeleted)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(parseInt(skip), parseInt(skip) + parseInt(limit))
      .reverse();

    // Manually populate replyTo messages
    messages = messages.map(message => {
      if (message.replyTo) {
        const repliedMessage = chat.messages.id(message.replyTo);
        if (repliedMessage && !repliedMessage.isDeleted) {
          message.replyTo = repliedMessage;
        } else {
          message.replyTo = null;
        }
      }
      return message;
    });

    res.json({
      success: true,
      data: {
        messages,
        hasMore: chat.messages.length > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching chat messages',
      error: error.message
    });
  }
},

  // Send message
  sendMessage: async (req, res) => {
    try {
      const userId = req.user.id;
      const { groupId } = req.params;
      const { content, messageType = 'text', replyTo, mentions } = req.body;

      // Verify user is a member of the group
      const group = await StudyGroup.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }

      const userRole = group.getMemberRole(userId);
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Must be a group member to send messages'
        });
      }

      let chat = await GroupChat.findOne({ groupId });
      if (!chat) {
        chat = new GroupChat({ groupId });
      }

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

    // Populate sender info and mentions for response
    await chat.populate('messages.sender', 'email');
    await chat.populate('messages.mentions', 'email');
    
    const populatedMessage = chat.messages[chat.messages.length - 1];
    
    // Manually populate replyTo if it exists
    if (populatedMessage.replyTo) {
      const repliedMessage = chat.messages.id(populatedMessage.replyTo);
      if (repliedMessage && !repliedMessage.isDeleted) {
        populatedMessage.replyTo = repliedMessage;
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
},

  // Edit message
  editMessage: async (req, res) => {
    try {
      const userId = req.user.id;
      const { groupId, messageId } = req.params;
      const { content } = req.body;

     

      // Verify user is a member of the group
      const group = await StudyGroup.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }

      const userRole = group.getMemberRole(userId);
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Must be a group member to edit messages'
        });
      }

      const chat = await GroupChat.findOne({ groupId });
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }

   

      const edited = chat.editMessage(messageId, userId, content);
      if (!edited) {
        return res.status(400).json({
          success: false,
          message: 'Cannot edit this message - either message not found or you are not the sender'
        });
      }

      await chat.save();

      res.json({
        success: true,
        message: 'Message edited successfully'
      });
    } catch (error) {
      console.error('Edit message error:', error);
      res.status(500).json({
        success: false,
        message: 'Error editing message',
        error: error.message
      });
    }
  },

  // Delete message
  deleteMessage: async (req, res) => {
    try {
      const userId = req.user.id;
      const { groupId, messageId } = req.params;

      const chat = await GroupChat.findOne({ groupId });
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }

      const deleted = chat.deleteMessage(messageId, userId);
      if (!deleted) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete this message'
        });
      }

      await chat.save();

      res.json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting message',
        error: error.message
      });
    }
  },

  // Add reaction
  addReaction: async (req, res) => {
    try {
      const userId = req.user.id;
      const { groupId, messageId } = req.params;
      const { emoji } = req.body;

      const chat = await GroupChat.findOne({ groupId });
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }

      const reacted = chat.addReaction(messageId, userId, emoji);
      if (!reacted) {
        return res.status(400).json({
          success: false,
          message: 'Message not found'
        });
      }

      await chat.save();

      res.json({
        success: true,
        message: 'Reaction added successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding reaction',
        error: error.message
      });
    }
  },

  // Mark messages as read
  markAsRead: async (req, res) => {
    try {
      const userId = req.user.id;
      const { groupId } = req.params;
      const { messageIds } = req.body;

      const chat = await GroupChat.findOne({ groupId });
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }

      if (Array.isArray(messageIds)) {
        messageIds.forEach(messageId => {
          chat.markMessageRead(messageId, userId);
        });
      }

      await chat.save();

      res.json({
        success: true,
        message: 'Messages marked as read'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error marking messages as read',
        error: error.message
      });
    }
  },

  // Get unread message count
  getUnreadCount: async (req, res) => {
    try {
      const userId = req.user.id;
      const { groupId } = req.params;

      const chat = await GroupChat.findOne({ groupId });
      if (!chat) {
        return res.json({
          success: true,
          data: { unreadCount: 0 }
        });
      }

      const unreadCount = chat.messages.filter(message => 
        !message.isDeleted &&
        message.sender.toString() !== userId.toString() &&
        !message.readBy.some(read => read.userId.toString() === userId.toString())
      ).length;

      res.json({
        success: true,
        data: { unreadCount }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error getting unread count',
        error: error.message
      });
    }
  },

  // Search messages
  searchMessages: async (req, res) => {
    try {
      const userId = req.user.id;
      const { groupId } = req.params;
      const { query, limit = 20 } = req.query;

      // Verify user is a member
      const group = await StudyGroup.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }

      const userRole = group.getMemberRole(userId);
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Must be a group member to search messages'
        });
      }

      const chat = await GroupChat.findOne({ groupId })
        .populate('messages.sender', 'email');

      if (!chat) {
        return res.json({
          success: true,
          data: []
        });
      }

      const searchResults = chat.messages
        .filter(message => 
          !message.isDeleted &&
          message.content.toLowerCase().includes(query.toLowerCase())
        )
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, parseInt(limit));

      res.json({
        success: true,
        data: searchResults
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error searching messages',
        error: error.message
      });
    }
  }
};

module.exports = groupChatController;