const mongoose = require('mongoose');

const groupChatSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    required: true
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'image', 'link', 'announcement'],
      default: 'text'
    },
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    
    // Message status
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    
    // Reactions
    reactions: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      emoji: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    // Read receipts
    readBy: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    // Reply functionality
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
     
    },
    
    // Mentions
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Chat settings
  settings: {
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowLinks: {
      type: Boolean,
      default: true
    },
    mutedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    pinnedMessages: [{
      type: mongoose.Schema.Types.ObjectId,
      
    }]
  },
  
  // Activity tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
groupChatSchema.virtual('recentMessages').get(function() {
  return this.messages
    .filter(msg => !msg.isDeleted)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50);
});

// Methods
groupChatSchema.methods.addMessage = function(senderId, content, messageType = 'text', fileData = null) {
  const newMessage = {
    sender: senderId,
    content,
    messageType,
    timestamp: new Date()
  };
  
  if (fileData) {
    newMessage.fileUrl = fileData.url;
    newMessage.fileName = fileData.name;
    newMessage.fileSize = fileData.size;
  }
  
  this.messages.push(newMessage);
  this.messageCount += 1;
  this.lastActivity = new Date();
  
  return this.messages[this.messages.length - 1];
};

groupChatSchema.methods.markMessageRead = function(messageId, userId) {
  const message = this.messages.id(messageId);
  if (message) {
    const alreadyRead = message.readBy.find(
      read => read.userId.toString() === userId.toString()
    );
    
    if (!alreadyRead) {
      message.readBy.push({
        userId,
        readAt: new Date()
      });
    }
    
    return true;
  }
  
  return false;
};

groupChatSchema.methods.addReaction = function(messageId, userId, emoji) {
  const message = this.messages.id(messageId);
  if (message) {
    const existingReaction = message.reactions.find(
      reaction => reaction.userId.toString() === userId.toString() && reaction.emoji === emoji
    );
    
    if (existingReaction) {
      // Remove reaction if it exists
      message.reactions = message.reactions.filter(
        reaction => !(reaction.userId.toString() === userId.toString() && reaction.emoji === emoji)
      );
    } else {
      // Add new reaction
      message.reactions.push({
        userId,
        emoji,
        createdAt: new Date()
      });
    }
    
    return true;
  }
  
  return false;
};

groupChatSchema.methods.deleteMessage = function(messageId, userId) {
  const message = this.messages.id(messageId);
  if (message && message.sender.toString() === userId.toString()) {
    message.isDeleted = true;
    message.deletedAt = new Date();
    return true;
  }
  
  return false;
};

groupChatSchema.methods.editMessage = function(messageId, userId, newContent) {
  const message = this.messages.id(messageId);
  if (message && message.sender.toString() === userId.toString()) {
    message.content = newContent;
    message.isEdited = true;
    message.editedAt = new Date();
    return true;
  }
  
  return false;
};

// Indexes
groupChatSchema.index({ groupId: 1 });
groupChatSchema.index({ 'messages.sender': 1 });
groupChatSchema.index({ 'messages.timestamp': -1 });
groupChatSchema.index({ lastActivity: -1 });

module.exports = mongoose.model('GroupChat', groupChatSchema);