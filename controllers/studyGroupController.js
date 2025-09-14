const StudyGroup = require('../models/StudyGroup');
const StudySession = require('../models/StudySession');
const GroupChat = require('../models/GroupChat');

const studyGroupController = {
  // Get all groups for a student
  getMyGroups: async (req, res) => {
    try {
      const userId = req.user.id;
      
     const groups = await StudyGroup.find({
         members: { $elemMatch: { userId, isActive: true } }
      })
      .populate('creator', 'email')
      .populate('members.userId', 'email')
      .sort({ lastActivity: -1 });

      // Get recent activity for each group
      const groupsWithActivity = await Promise.all(
        groups.map(async (group) => {
          const recentSessions = await StudySession.find({
            groupId: group._id,
            scheduledDate: { $gte: new Date() }
          })
          .sort({ scheduledDate: 1 })
          .limit(1);

          const chat = await GroupChat.findOne({ groupId: group._id });
          
          return {
            ...group.toObject(),
            nextSession: recentSessions[0] || null,
            recentActivity: group.lastActivity,
            memberAvatars: group.members.slice(0, 4).map(member => 
              member.userId.email.substring(0, 2).toUpperCase()
            )
          };
        })
      );

      res.json({
        success: true,
        data: groupsWithActivity
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching groups',
        error: error.message
      });
    }
  },

  // Get recommended groups
  getRecommendedGroups: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get groups user is not a member of
      const myGroupIds = await StudyGroup.find({
        'members.userId': userId,
        'members.isActive': true
      }).distinct('_id');

      const recommendedGroups = await StudyGroup.find({
        _id: { $nin: myGroupIds },
        isActive: true,
        isPublic: true
      })
      .populate('creator', 'email')
      .sort({ memberCount: -1, lastActivity: -1 })
      .limit(6);

      const groupsWithDetails = recommendedGroups.map(group => ({
        ...group.toObject(),
        members: group.memberCount,
        meetingTime: group.formattedMeetingTime,
        tags: group.tags || [],
        memberAvatars: ['JH', 'KL', 'NP', 'QR'] // Placeholder
      }));

      res.json({
        success: true,
        data: groupsWithDetails
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching recommended groups',
        error: error.message
      });
    }
  },

  // Get upcoming sessions
  getUpcomingSessions: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get user's groups
      const userGroups = await StudyGroup.find({
        'members.userId': userId,
        'members.isActive': true
      }).distinct('_id');

      const upcomingSessions = await StudySession.find({
        groupId: { $in: userGroups },
        scheduledDate: { $gte: new Date() },
        status: 'scheduled'
      })
      .populate('groupId', 'name')
      .populate('host', 'email')
      .sort({ scheduledDate: 1 })
      .limit(10);

      const sessionsWithDetails = upcomingSessions.map(session => ({
        id: session._id,
        groupId: session.groupId._id,
        groupName: session.groupId.name,
        topic: session.topic,
        date: session.formattedDate,
        time: session.formattedTime,
        type: session.type,
        attendees: session.attendeeCount
      }));

      res.json({
        success: true,
        data: sessionsWithDetails
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching upcoming sessions',
        error: error.message
      });
    }
  },

  // Get group statistics for dashboard
  getGroupStats: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get user's groups
      const userGroups = await StudyGroup.find({
        'members.userId': userId,
        'members.isActive': true
      });

      // Calculate sessions attended
      const sessionsAttended = await StudySession.countDocuments({
        'attendees.userId': userId,
        'attendees.status': 'attended'
      });

      // Calculate total study hours from sessions
      const attendedSessions = await StudySession.find({
        'attendees.userId': userId,
        'attendees.status': 'attended'
      });

      const totalHours = attendedSessions.reduce((total, session) => {
        const userAttendance = session.attendees.find(
          a => a.userId.toString() === userId.toString()
        );
        return total + (userAttendance?.timeSpent || session.duration || 0);
      }, 0);

      // Count unique fellow students
      const allMembers = new Set();
      userGroups.forEach(group => {
        group.members.forEach(member => {
          if (member.userId.toString() !== userId.toString() && member.isActive) {
            allMembers.add(member.userId.toString());
          }
        });
      });

      const stats = {
        groupsJoined: userGroups.length,
        studySessions: sessionsAttended,
        hoursStudied: Math.round(totalHours / 60), // Convert minutes to hours
        fellowStudents: allMembers.size
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching group statistics',
        error: error.message
      });
    }
  },

  // Create new group
  createGroup: async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        name,
        description,
        category,
        maxMembers,
        meetingSchedule,
        isPublic,
        tags
      } = req.body;

      const newGroup = new StudyGroup({
        name,
        description,
        category,
        creator: userId,
        maxMembers: maxMembers || 50,
        meetingSchedule,
        isPublic: isPublic !== false,
        tags: tags || []
      });

      // Add creator as admin member
      newGroup.addMember(userId, 'admin');

      await newGroup.save();

      // Create group chat
      const groupChat = new GroupChat({
        groupId: newGroup._id
      });
      await groupChat.save();

      res.status(201).json({
        success: true,
        message: 'Study group created successfully',
        data: newGroup
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating group',
        error: error.message
      });
    }
  },

  // Join group
  joinGroup: async (req, res) => {
    try {
      const userId = req.user.id;
      const { groupId } = req.params;

      const group = await StudyGroup.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }

      if (!group.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Group is not active'
        });
      }

      try {
        const added = group.addMember(userId);
        if (!added) {
          return res.status(400).json({
            success: false,
            message: 'Already a member of this group'
          });
        }

        await group.save();
        await group.updateActivity();

        res.json({
          success: true,
          message: 'Successfully joined the group',
          data: group
        });
      } catch (error) {
        if (error.message.includes('maximum capacity')) {
          return res.status(400).json({
            success: false,
            message: error.message
          });
        }
        throw error;
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error joining group',
        error: error.message
      });
    }
  },

  // Leave group
  leaveGroup: async (req, res) => {
    try {
      const userId = req.user.id;
      const { groupId } = req.params;
      console.log("Fetching groups for:", userId);

      const group = await StudyGroup.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }

      const removed = group.removeMember(userId);
      if (!removed) {
        return res.status(400).json({
          success: false,
          message: 'Not a member of this group'
        });
      }

      await group.save();

      res.json({
        success: true,
        message: 'Successfully left the group'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error leaving group',
        error: error.message
      });
    }
  },

  // Get group details
  getGroupDetails: async (req, res) => {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const group = await StudyGroup.findById(groupId)
        .populate('creator', 'email')
        .populate('members.userId', 'email');

      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }

      // Check if user is a member
      const userRole = group.getMemberRole(userId);
      
      // Get recent sessions
      const recentSessions = await StudySession.find({
        groupId: group._id
      })
      .sort({ scheduledDate: -1 })
      .limit(5)
      .populate('host', 'email');

      res.json({
        success: true,
        data: {
          ...group.toObject(),
          userRole,
          recentSessions
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching group details',
        error: error.message
      });
    }
  }
};

module.exports = studyGroupController;