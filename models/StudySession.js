const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  topic: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Study Session', 'Workshop', 'Project Work', 'Discussion', 'Review', 'Presentation'],
    default: 'Study Session'
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // Duration in minutes
    default: 60
  },
  
  // Session details
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  
  // Attendees
  attendees: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'missed', 'cancelled'],
      default: 'registered'
    },
    joinedAt: Date,
    leftAt: Date,
    timeSpent: Number // Minutes attended
  }],
  
  // Session content
  agenda: [{
    item: String,
    duration: Number, // Minutes
    completed: {
      type: Boolean,
      default: false
    }
  }],
  
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['link', 'document', 'video', 'presentation', 'code']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Meeting details
  meetingLink: String,
  recordingUrl: String,
  
  // Session summary
  notes: String,
  outcomes: [String],
  nextSteps: [String],
  
  // Statistics
  stats: {
    totalAttendees: {
      type: Number,
      default: 0
    },
    averageAttendance: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
studySessionSchema.virtual('attendeeCount').get(function() {
  return this.attendees ? this.attendees.length : 0;
});

studySessionSchema.virtual('actualAttendeeCount').get(function() {
  return this.attendees ? this.attendees.filter(a => a.status === 'attended').length : 0;
});

studySessionSchema.virtual('isUpcoming').get(function() {
  return this.scheduledDate > new Date() && this.status === 'scheduled';
});

studySessionSchema.virtual('formattedDate').get(function() {
  return this.scheduledDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

studySessionSchema.virtual('formattedTime').get(function() {
  return this.scheduledDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
});

// Methods
studySessionSchema.methods.addAttendee = function(userId) {
  const existingAttendee = this.attendees.find(
    attendee => attendee.userId.toString() === userId.toString()
  );
  
  if (existingAttendee) {
    return false; // Already registered
  }
  
  this.attendees.push({
    userId,
    status: 'registered'
  });
  
  return true;
};

studySessionSchema.methods.markAttendance = function(userId, status = 'attended') {
  const attendee = this.attendees.find(
    attendee => attendee.userId.toString() === userId.toString()
  );
  
  if (attendee) {
    attendee.status = status;
    if (status === 'attended') {
      attendee.joinedAt = new Date();
    }
    return true;
  }
  
  return false;
};

studySessionSchema.methods.calculateStats = function() {
  this.stats.totalAttendees = this.attendeeCount;
  this.stats.averageAttendance = this.attendeeCount > 0 ? 
    (this.actualAttendeeCount / this.attendeeCount) * 100 : 0;
  
  return this.save();
};

// Indexes
studySessionSchema.index({ groupId: 1 });
studySessionSchema.index({ scheduledDate: 1 });
studySessionSchema.index({ status: 1 });
studySessionSchema.index({ host: 1 });
studySessionSchema.index({ 'attendees.userId': 1 });

module.exports = mongoose.model('StudySession', studySessionSchema);