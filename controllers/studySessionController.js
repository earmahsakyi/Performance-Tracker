const StudySession = require('../models/StudySession');
const StudyGroup = require('../models/StudyGroup');

const studySessionController = {
  // Create new study session
  createSession: async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        groupId,
        title,
        description,
        topic,
        type,
        scheduledDate,
        duration,
        agenda,
        meetingLink
      } = req.body;

      // Verify user is a member of the group
      const group = await StudyGroup.findById(groupId);
 
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }

      const userRole = group.getMemberRole(userId);
      if (!userRole || !['admin', 'moderator'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to create sessions'
        });
      }

      const newSession = new StudySession({
        groupId,
        title,
        description,
        topic,
        type: type || 'Study Session',
        scheduledDate: new Date(scheduledDate),
        duration: duration || 60,
        host: userId,
        agenda: agenda || [],
        meetingLink
      });

      await newSession.save();

      // Update group's next session date
      group.nextSessionDate = new Date(scheduledDate);
      await group.save();

      res.status(201).json({
        success: true,
        message: 'Study session created successfully',
        data: newSession
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating study session',
        error: error.message
      });
    }
  },

  // Get sessions for a group
  getGroupSessions: async (req, res) => {
    try {
      const { groupId } = req.params;
      const { status, limit = 10 } = req.query;

      let query = { groupId };
      if (status) {
        query.status = status;
      }

      const sessions = await StudySession.find(query)
        .populate('host', 'email')
        .populate('attendees.userId', 'email')
        .sort({ scheduledDate: -1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: sessions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching sessions',
        error: error.message
      });
    }
  },

  // Register for session
  registerForSession: async (req, res) => {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      const session = await StudySession.findById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Check if user is a member of the group
      const group = await StudyGroup.findById(session.groupId);
      const userRole = group.getMemberRole(userId);
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Must be a group member to register for sessions'
        });
      }

      const registered = session.addAttendee(userId);
      if (!registered) {
        return res.status(400).json({
          success: false,
          message: 'Already registered for this session'
        });
      }

      await session.save();

      res.json({
        success: true,
        message: 'Successfully registered for session',
        data: session
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error registering for session',
        error: error.message
      });
    }
  },

  // Mark attendance
  markAttendance: async (req, res) => {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;
      const { status = 'attended' } = req.body;

      const session = await StudySession.findById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      const marked = session.markAttendance(userId, status);
      if (!marked) {
        return res.status(400).json({
          success: false,
          message: 'Not registered for this session'
        });
      }

      await session.save();
      await session.calculateStats();

      res.json({
        success: true,
        message: 'Attendance marked successfully',
        data: session
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error marking attendance',
        error: error.message
      });
    }
  },

  // Get session details
  getSessionDetails: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const session = await StudySession.findById(sessionId)
        .populate('host', 'email')
        .populate('attendees.userId', 'email')
        .populate('groupId', 'name');

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Check if user is registered
      const userAttendee = session.attendees.find(
        attendee => attendee.userId._id.toString() === userId.toString()
      );

      res.json({
        success: true,
        data: {
          ...session.toObject(),
          userRegistered: !!userAttendee,
          userAttendanceStatus: userAttendee?.status || null
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching session details',
        error: error.message
      });
    }
  },

  // Update session
  updateSession: async (req, res) => {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;
      const updates = req.body;

      const session = await StudySession.findById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Check permissions
      if (session.host.toString() !== userId.toString()) {
        const group = await StudyGroup.findById(session.groupId);
        const userRole = group.getMemberRole(userId);
        if (!['admin', 'moderator'].includes(userRole)) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions to update session'
          });
        }
      }

      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          session[key] = updates[key];
        }
      });

      await session.save();

      res.json({
        success: true,
        message: 'Session updated successfully',
        data: session
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating session',
        error: error.message
      });
    }
  },

  // Cancel session
  cancelSession: async (req, res) => {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      const session = await StudySession.findById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Check permissions
      if (session.host.toString() !== userId.toString()) {
        const group = await StudyGroup.findById(session.groupId);
        const userRole = group.getMemberRole(userId);
        if (!['admin', 'moderator'].includes(userRole)) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions to cancel session'
          });
        }
      }

      session.status = 'cancelled';
      await session.save();

      res.json({
        success: true,
        message: 'Session cancelled successfully',
        data: session
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error cancelling session',
        error: error.message
      });
    }
  },

  // Get user's upcoming sessions
  getMyUpcomingSessions: async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;

      // Get user's groups
      const userGroups = await StudyGroup.find({
        'members.userId': userId,
        'members.isActive': true
      }).distinct('_id');

      const upcomingSessions = await StudySession.find({
        $or: [
          { groupId: { $in: userGroups }, scheduledDate: { $gte: new Date() } },
          { 'attendees.userId': userId, scheduledDate: { $gte: new Date() } }
        ],
        status: { $in: ['scheduled', 'ongoing'] }
      })
      .populate('groupId', 'name category')
      .populate('host', 'email')
      .sort({ scheduledDate: 1 })
      .limit(parseInt(limit));

      res.json({
        success: true,
        data: upcomingSessions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching upcoming sessions',
        error: error.message
      });
    }
  },

  // Join session (start/join meeting)
  joinSession: async (req, res) => {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      const session = await StudySession.findById(sessionId)
        .populate('groupId', 'name');

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Check if session is happening now or soon (within 15 minutes)
      const now = new Date();
      const sessionTime = new Date(session.scheduledDate);
      const timeDiff = sessionTime - now;
      
      if (timeDiff > 15 * 60 * 1000) { // More than 15 minutes early
        return res.status(400).json({
          success: false,
          message: 'Session has not started yet'
        });
      }

      if (timeDiff < -session.duration * 60 * 1000) { // Session ended
        return res.status(400).json({
          success: false,
          message: 'Session has ended'
        });
      }

      // Mark user as attending if registered
      session.markAttendance(userId, 'attended');
      
      // Update session status if needed
      if (session.status === 'scheduled' && timeDiff <= 0) {
        session.status = 'ongoing';
      }

      await session.save();

      res.json({
        success: true,
        message: 'Joining session',
        data: {
          sessionId: session._id,
          meetingLink: session.meetingLink,
          groupName: session.groupId.name,
          topic: session.topic
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error joining session',
        error: error.message
      });
    }
  }
};

module.exports = studySessionController;