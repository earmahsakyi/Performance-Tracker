const mongoose = require('mongoose');

const studyGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'Frontend Development',
      'Backend Development', 
      'Full Stack',
      'Design',
      'Programming',
      'Career',
      'Mobile Development',
      'Data Science',
      'DevOps',
      'Other'
    ],
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  maxMembers: {
    type: Number,
    default: 50
  },
  meetingSchedule: {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    time: {
      type: String // Format: "7:00 PM"
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [String],
  
  // Group statistics
  stats: {
    totalSessions: {
      type: Number,
      default: 0
    },
    totalStudyHours: {
      type: Number,
      default: 0
    },
    averageAttendance: {
      type: Number,
      default: 0
    }
  },
  
  // Recent activity tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  lastSessionDate: {
    type: Date
  },
  nextSessionDate: {
    type: Date
  },
  
  // Group settings
  settings: {
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowScreenShare: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
studyGroupSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.filter(member => member.isActive).length : 0;
});

studyGroupSchema.virtual('formattedMeetingTime').get(function() {
  if (this.meetingSchedule.day && this.meetingSchedule.time) {
    return `${this.meetingSchedule.day}s ${this.meetingSchedule.time}`;
  }
  return null;
});

// Methods
studyGroupSchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(
    member => member.userId.toString() === userId.toString()
  );
  
  if (existingMember) {
    if (!existingMember.isActive) {
      existingMember.isActive = true;
      existingMember.joinedAt = new Date();
    }
    return false; // Already a member
  }
  
  if (this.memberCount >= this.maxMembers) {
    throw new Error('Group has reached maximum capacity');
  }
  
  this.members.push({
    userId,
    role,
    joinedAt: new Date(),
    isActive: true
  });
  
  return true;
};

studyGroupSchema.methods.removeMember = function(userId) {
  console.log("Before remove:", this.members);
  const memberIndex = this.members.findIndex(
    member => member.userId.toString() === userId.toString()
  );
  if (memberIndex > -1) {
    this.members[memberIndex].isActive = false;
    console.log("After remove:", this.members[memberIndex]);
    return true;
  }
  return false;
};

studyGroupSchema.methods.getMemberRole = function(userId) {
  const member = this.members.find(
    member => member.userId.toString() === userId.toString() && member.isActive
  );
  
  return member ? member.role : null;
};

studyGroupSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Indexes
studyGroupSchema.index({ category: 1 });
studyGroupSchema.index({ 'members.userId': 1 });
studyGroupSchema.index({ creator: 1 });
studyGroupSchema.index({ isActive: 1, isPublic: 1 });
studyGroupSchema.index({ tags: 1 });

module.exports = mongoose.model('StudyGroup', studyGroupSchema);