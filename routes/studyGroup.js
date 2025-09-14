const express = require('express');
const router = express.Router();
const studyGroupController = require('../controllers/studyGroupController');
const studySessionController = require('../controllers/studySessionController');
const groupChatController = require('../controllers/groupChatController');
const auth = require('../middleware/auth');

// Apply authentication middleware to all routes


// ==================== STUDY GROUPS ====================

// Get dashboard data
router.get('/dashboard/my-groups',auth, studyGroupController.getMyGroups);
router.get('/dashboard/recommended',auth, studyGroupController.getRecommendedGroups);
router.get('/dashboard/upcoming-sessions',auth, studyGroupController.getUpcomingSessions);
router.get('/dashboard/stats',auth, studyGroupController.getGroupStats);

// Group management
router.post('/create',auth, studyGroupController.createGroup);
router.get('/:groupId',auth, studyGroupController.getGroupDetails);
router.post('/:groupId/join',auth, studyGroupController.joinGroup);
router.delete('/:groupId/leave',auth, studyGroupController.leaveGroup);

// ==================== STUDY SESSIONS ====================

// Session management
router.post('/:groupId/sessions',auth, studySessionController.createSession);
router.get('/:groupId/sessions',auth, studySessionController.getGroupSessions);
router.get('/sessions/my-upcoming',auth, studySessionController.getMyUpcomingSessions);

// Individual session operations
router.get('/sessions/:sessionId',auth, studySessionController.getSessionDetails);
router.put('/sessions/:sessionId',auth, studySessionController.updateSession);
router.delete('/sessions/:sessionId',auth, studySessionController.cancelSession);

// Session participation
router.post('/sessions/:sessionId/register',auth, studySessionController.registerForSession);
router.post('/sessions/:sessionId/attendance',auth, studySessionController.markAttendance);
router.post('/sessions/:sessionId/join',auth, studySessionController.joinSession);

// ==================== GROUP CHAT ====================

// Chat management
router.get('/:groupId/chat/messages',auth, groupChatController.getChatMessages);
router.post('/:groupId/chat/messages',auth, groupChatController.sendMessage);
router.get('/:groupId/chat/unread-count',auth, groupChatController.getUnreadCount);
router.get('/:groupId/chat/search',auth, groupChatController.searchMessages);

// Message operations
router.put('/:groupId/chat/messages/:messageId',auth, groupChatController.editMessage);
router.delete('/:groupId/chat/messages/:messageId',auth, groupChatController.deleteMessage);
router.post('/:groupId/chat/messages/:messageId/reaction',auth, groupChatController.addReaction);
router.post('/:groupId/chat/mark-read',auth, groupChatController.markAsRead);

module.exports = router;