import axios from 'axios';
import { STUDY_GROUP_TYPES } from './types';

const API_BASE_URL = '/api/study-groups';

// Helper function for error handling
const handleError = (error) => {
  return error.response?.data?.message || 
         error.message || 
         'An unexpected error occurred';
};

// Get My Groups
export const getMyGroups = () => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.GET_MY_GROUPS_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.get(`${API_BASE_URL}/dashboard/my-groups`, config);

    dispatch({
      type: STUDY_GROUP_TYPES.GET_MY_GROUPS_SUCCESS,
      payload: response.data.data
    });

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.GET_MY_GROUPS_FAIL,
      payload: handleError(error)
    });
  }
};

// Get Recommended Groups
export const getRecommendedGroups = () => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.GET_RECOMMENDED_GROUPS_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.get(`${API_BASE_URL}/dashboard/recommended`, config);

    dispatch({
      type: STUDY_GROUP_TYPES.GET_RECOMMENDED_GROUPS_SUCCESS,
      payload: response.data.data
    });

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.GET_RECOMMENDED_GROUPS_FAIL,
      payload: handleError(error)
    });
  }
};

// Get Upcoming Sessions
export const getUpcomingSessions = () => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.GET_UPCOMING_SESSIONS_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.get(`${API_BASE_URL}/dashboard/upcoming-sessions`, config)
    dispatch({
      type: STUDY_GROUP_TYPES.GET_UPCOMING_SESSIONS_SUCCESS,
      payload: response.data.data
    });

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.GET_UPCOMING_SESSIONS_FAIL,
      payload: handleError(error)
    });
  }
};

// Get Group Stats
export const getGroupStats = () => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.GET_GROUP_STATS_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.get(`${API_BASE_URL}/dashboard/stats`, config);

    dispatch({
      type: STUDY_GROUP_TYPES.GET_GROUP_STATS_SUCCESS,
      payload: response.data.data
    });

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.GET_GROUP_STATS_FAIL,
      payload: handleError(error)
    });
  }
};



// Create Group
export const createGroup = (groupData) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.CREATE_GROUP_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.post(`${API_BASE_URL}/create`, groupData, config);

    dispatch({
      type: STUDY_GROUP_TYPES.CREATE_GROUP_SUCCESS,
      payload: response.data.data
    });

    return response.data;

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.CREATE_GROUP_FAIL,
      payload: handleError(error)
    });
    throw error;
  }
};

// Get Group Details
export const getGroupDetails = (groupId) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.GET_GROUP_DETAILS_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.get(`${API_BASE_URL}/${groupId}`, config);

    dispatch({
      type: STUDY_GROUP_TYPES.GET_GROUP_DETAILS_SUCCESS,
      payload: response.data.data
    });

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.GET_GROUP_DETAILS_FAIL,
      payload: handleError(error)
    });
  }
};

// Join Group
export const joinGroup = (groupId) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.JOIN_GROUP_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }

    };
    console.log(groupId)
    const response = await axios.post(`${API_BASE_URL}/${groupId}/join`, {}, config);

    dispatch({
      type: STUDY_GROUP_TYPES.JOIN_GROUP_SUCCESS,
      payload: { groupId, group: response.data.data }
    });

    return response.data;

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.JOIN_GROUP_FAIL,
      payload: handleError(error)
    });
    throw error;
  }
};

// Leave Group
export const leaveGroup = (groupId) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.LEAVE_GROUP_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
       'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    await axios.delete(`${API_BASE_URL}/${groupId}/leave`, config);

    dispatch({
      type: STUDY_GROUP_TYPES.LEAVE_GROUP_SUCCESS,
      payload: groupId
    });
    return{ success : true};

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.LEAVE_GROUP_FAIL,
      payload: handleError(error)
    });
    throw error;
  }
};



// Create Session
export const createSession = (groupId, sessionData) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.CREATE_SESSION_REQUEST });

    const { auth: { token } } = getState();
    
    // Debug logs
    console.log('Creating session for groupId:', groupId);
    console.log('Session data:', sessionData);
    console.log('Token exists:', !!token);

    const config = {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json'
      }
    };

    // Include groupId in the request body, not just the URL
    const requestData = {
      ...sessionData,
      groupId: groupId // Make sure groupId is in the body
    };

    // Use consistent base URL and correct route structure
    const response = await axios.post(`${API_BASE_URL}/${groupId}/sessions`, requestData, config);

    dispatch({
      type: STUDY_GROUP_TYPES.CREATE_SESSION_SUCCESS,
      payload: response.data.data
    });

    return response.data;

  } catch (error) {
    console.error('Create session error details:');
    console.error('Status:', error.response?.status);
    console.error('Status text:', error.response?.statusText);
    console.error('Response data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request method:', error.config?.method);
    console.error('Request headers:', error.config?.headers);
    console.error('Request data:', error.config?.data);
    
    dispatch({
      type: STUDY_GROUP_TYPES.CREATE_SESSION_FAIL,
      payload: handleError(error)
    });
    throw error;
  }
};

// Get Group Sessions
export const getGroupSessions = (groupId, params = {}) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.GET_GROUP_SESSIONS_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      },
      params
    };

    const response = await axios.get(`${API_BASE_URL}/${groupId}/sessions`, config);

    dispatch({
      type: STUDY_GROUP_TYPES.GET_GROUP_SESSIONS_SUCCESS,
      payload: { groupId, sessions: response.data.data }
    });

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.GET_GROUP_SESSIONS_FAIL,
      payload: handleError(error)
    });
  }
};

// Get My Upcoming Sessions
export const getMyUpcomingSessions = (params = {}) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.GET_MY_UPCOMING_SESSIONS_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      },
      params
    };

    const response = await axios.get(`${API_BASE_URL}/sessions/my-upcoming`, config);

    dispatch({
      type: STUDY_GROUP_TYPES.GET_MY_UPCOMING_SESSIONS_SUCCESS,
      payload: response.data.data
    });

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.GET_MY_UPCOMING_SESSIONS_FAIL,
      payload: handleError(error)
    });
  }
};

// Get Session Details
export const getSessionDetails = (sessionId) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.GET_SESSION_DETAILS_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}`, config);

    dispatch({
      type: STUDY_GROUP_TYPES.GET_SESSION_DETAILS_SUCCESS,
      payload: response.data.data
    });

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.GET_SESSION_DETAILS_FAIL,
      payload: handleError(error)
    });
  }
};

// Register for Session
export const registerForSession = (sessionId) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.REGISTER_FOR_SESSION_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.post(`${API_BASE_URL}/sessions/${sessionId}/register`, {}, config);

    dispatch({
      type: STUDY_GROUP_TYPES.REGISTER_FOR_SESSION_SUCCESS,
      payload: { sessionId, session: response.data.data }
    });

    return response.data;

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.REGISTER_FOR_SESSION_FAIL,
      payload: handleError(error)
    });
    throw error;
  }
};

// Mark Attendance
export const markAttendance = (sessionId, status = 'attended') => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.MARK_ATTENDANCE_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.post(
      `${API_BASE_URL}/sessions/${sessionId}/attendance`, 
      { status }, 
      config
    );

    dispatch({
      type: STUDY_GROUP_TYPES.MARK_ATTENDANCE_SUCCESS,
      payload: { sessionId, session: response.data.data }
    });

    return response.data;

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.MARK_ATTENDANCE_FAIL,
      payload: handleError(error)
    });
    throw error;
  }
};

// Update Session
export const updateSession = (sessionId, updateData) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.UPDATE_SESSION_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.put(
      `${API_BASE_URL}/sessions/${sessionId}`, 
      updateData, 
      config
    );

    dispatch({
      type: STUDY_GROUP_TYPES.UPDATE_SESSION_SUCCESS,
      payload: { sessionId, session: response.data.data }
    });

    return response.data;

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.UPDATE_SESSION_FAIL,
      payload: handleError(error)
    });
    throw error;
  }
};

// Cancel Session
export const cancelSession = (sessionId) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.CANCEL_SESSION_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.delete(`${API_BASE_URL}/sessions/${sessionId}`, config);

    dispatch({
      type: STUDY_GROUP_TYPES.CANCEL_SESSION_SUCCESS,
      payload: { sessionId, session: response.data.data }
    });

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.CANCEL_SESSION_FAIL,
      payload: handleError(error)
    });
    throw error;
  }
};

// Join Session
export const joinSession = (sessionId) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.JOIN_SESSION_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.post(`${API_BASE_URL}/sessions/${sessionId}/join`, {}, config);

    dispatch({
      type: STUDY_GROUP_TYPES.JOIN_SESSION_SUCCESS,
      payload: response.data.data
    });

    return response.data;

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.JOIN_SESSION_FAIL,
      payload: handleError(error)
    });
    throw error;
  }
};



// Get Chat Messages
export const getChatMessages = (groupId, params = {}) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.GET_CHAT_MESSAGES_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      },
      params
    };

    const response = await axios.get(`${API_BASE_URL}/${groupId}/chat/messages`, config);

    dispatch({
      type: STUDY_GROUP_TYPES.GET_CHAT_MESSAGES_SUCCESS,
      payload: { groupId, ...response.data.data }
    });

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.GET_CHAT_MESSAGES_FAIL,
      payload: handleError(error)
    });
  }
};

// Send Message
export const sendMessage = (groupId, messageData) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.SEND_MESSAGE_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.post(
      `${API_BASE_URL}/${groupId}/chat/messages`, 
      messageData, 
      config
    );

    dispatch({
      type: STUDY_GROUP_TYPES.SEND_MESSAGE_SUCCESS,
      payload: { groupId, message: response.data.data }
    });

    return response.data;

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.SEND_MESSAGE_FAIL,
      payload: handleError(error)
    });
    throw error;
  }
};

// Edit Message
export const editMessage = (groupId, messageId, content) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.EDIT_MESSAGE_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    await axios.put(
      `${API_BASE_URL}/${groupId}/chat/messages/${messageId}`, 
      { content }, 
      config
    );

    dispatch({
      type: STUDY_GROUP_TYPES.EDIT_MESSAGE_SUCCESS,
      payload: { groupId, messageId, content }
    });

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.EDIT_MESSAGE_FAIL,
      payload: handleError(error)
    });
    throw error;
  }
};

// Delete Message
export const deleteMessage = (groupId, messageId) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.DELETE_MESSAGE_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    await axios.delete(`${API_BASE_URL}/${groupId}/chat/messages/${messageId}`, config);

    dispatch({
      type: STUDY_GROUP_TYPES.DELETE_MESSAGE_SUCCESS,
      payload: { groupId, messageId }
    });

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.DELETE_MESSAGE_FAIL,
      payload: handleError(error)
    });
    throw error;
  }
};

// Add Reaction
export const addReaction = (groupId, messageId, emoji) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.ADD_REACTION_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    await axios.post(
      `${API_BASE_URL}/${groupId}/chat/messages/${messageId}/reaction`, 
      { emoji }, 
      config
    );

    dispatch({
      type: STUDY_GROUP_TYPES.ADD_REACTION_SUCCESS,
      payload: { groupId, messageId, emoji }
    });

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.ADD_REACTION_FAIL,
      payload: handleError(error)
    });
    throw error;
  }
};

// Mark Messages as Read
export const markMessagesAsRead = (groupId, messageIds) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.MARK_MESSAGES_READ_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    await axios.post(
      `${API_BASE_URL}/${groupId}/chat/mark-read`, 
      { messageIds }, 
      config
    );

    dispatch({
      type: STUDY_GROUP_TYPES.MARK_MESSAGES_READ_SUCCESS,
      payload: { groupId, messageIds }
    });

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.MARK_MESSAGES_READ_FAIL,
      payload: handleError(error)
    });
  }
};

// Get Unread Count
export const getUnreadCount = (groupId) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.GET_UNREAD_COUNT_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
         'x-auth-token':token,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.get(`${API_BASE_URL}/${groupId}/chat/unread-count`, config);

    dispatch({
      type: STUDY_GROUP_TYPES.GET_UNREAD_COUNT_SUCCESS,
      payload: { groupId, unreadCount: response.data.data.unreadCount }
    });

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.GET_UNREAD_COUNT_FAIL,
      payload: handleError(error)
    });
  }
};

// Search Messages
export const searchMessages = (groupId, query, limit = 20) => async (dispatch, getState) => {
  try {
    dispatch({ type: STUDY_GROUP_TYPES.SEARCH_MESSAGES_REQUEST });

    const { auth: { token } } = getState();
    const config = {
      headers: {
        'x-auth-token':token,
        'Content-Type': 'application/json'
      },
      params: { query, limit }
    };

    const response = await axios.get(`${API_BASE_URL}/${groupId}/chat/search`, config);

    dispatch({
      type: STUDY_GROUP_TYPES.SEARCH_MESSAGES_SUCCESS,
      payload: { groupId, searchResults: response.data.data, query }
    });

  } catch (error) {
    dispatch({
      type: STUDY_GROUP_TYPES.SEARCH_MESSAGES_FAIL,
      payload: handleError(error)
    });
  }
};



// Clear Errors
export const clearErrors = () => ({
  type: STUDY_GROUP_TYPES.CLEAR_ERRORS
});

// Clear Success Messages
export const clearSuccess = () => ({
  type: STUDY_GROUP_TYPES.CLEAR_SUCCESS
});

// Set Loading State
export const setLoading = (isLoading) => ({
  type: STUDY_GROUP_TYPES.SET_LOADING,
  payload: isLoading
});

// Reset State
export const resetState = () => ({
  type: STUDY_GROUP_TYPES.RESET_STATE
});


// Socket Connection Actions
export const connectToGroupChat = (groupId) => ({
  type: STUDY_GROUP_TYPES.CONNECT_TO_GROUP_CHAT,
  payload: { groupId }
});

export const disconnectFromGroupChat = (groupId) => ({
  type: STUDY_GROUP_TYPES.DISCONNECT_FROM_GROUP_CHAT,
  payload: { groupId }
});

export const setGroupChatConnected = (groupId, isConnected) => ({
  type: STUDY_GROUP_TYPES.SET_GROUP_CHAT_CONNECTED,
  payload: { groupId, isConnected }
});

// Real-time Message Actions
export const addGroupMessage = (groupId, message) => ({
  type: STUDY_GROUP_TYPES.ADD_GROUP_MESSAGE,
  payload: { groupId, message }
});

export const updateGroupMessage = (groupId, messageId, updates) => ({
  type: STUDY_GROUP_TYPES.UPDATE_GROUP_MESSAGE,
  payload: { groupId, messageId, updates }
});

export const removeGroupMessage = (groupId, messageId) => ({
  type: STUDY_GROUP_TYPES.REMOVE_GROUP_MESSAGE,
  payload: { groupId, messageId }
});

export const setGroupMessageSending = (groupId, tempMessageId, isSending) => ({
  type: STUDY_GROUP_TYPES.SET_MESSAGE_SENDING,
  payload: { groupId, tempMessageId, isSending }
});

// Typing Indicators
export const setGroupTyping = (groupId, userId, isTyping) => ({
  type: STUDY_GROUP_TYPES.SET_GROUP_TYPING,
  payload: { groupId, userId, isTyping }
});

export const clearGroupTyping = (groupId, userId) => ({
  type: STUDY_GROUP_TYPES.CLEAR_GROUP_TYPING,
  payload: { groupId, userId }
});

// Online Status
export const setGroupOnlineMembers = (groupId, onlineMembers) => ({
  type: STUDY_GROUP_TYPES.SET_GROUP_ONLINE_MEMBERS,
  payload: { groupId, onlineMembers }
});

export const addGroupOnlineMember = (groupId, userId) => ({
  type: STUDY_GROUP_TYPES.ADD_GROUP_ONLINE_MEMBER,
  payload: { groupId, userId }
});

export const removeGroupOnlineMember = (groupId, userId) => ({
  type: STUDY_GROUP_TYPES.REMOVE_GROUP_ONLINE_MEMBER,
  payload: { groupId, userId }
});

// Reactions
export const updateGroupMessageReactions = (groupId, messageId, reactions) => ({
  type: STUDY_GROUP_TYPES.UPDATE_GROUP_MESSAGE_REACTIONS,
  payload: { groupId, messageId, reactions }
});

// Read Receipts
export const updateGroupMessageReadStatus = (groupId, messageIds, readBy, readAt) => ({
  type: STUDY_GROUP_TYPES.UPDATE_GROUP_MESSAGE_READ_STATUS,
  payload: { groupId, messageIds, readBy, readAt }
});

// Mentions
export const addGroupMention = (mention) => ({
  type: STUDY_GROUP_TYPES.ADD_GROUP_MENTION,
  payload: mention
});

export const markGroupMentionRead = (mentionId) => ({
  type: STUDY_GROUP_TYPES.MARK_GROUP_MENTION_READ,
  payload: { mentionId }
});

export const clearGroupMentions = (groupId) => ({
  type: STUDY_GROUP_TYPES.CLEAR_GROUP_MENTIONS,
  payload: { groupId }
});

// Error Handling
export const setGroupChatError = (groupId, error) => ({
  type: STUDY_GROUP_TYPES.SET_GROUP_CHAT_ERROR,
  payload: { groupId, error }
});

export const clearGroupChatError = (groupId) => ({
  type: STUDY_GROUP_TYPES.CLEAR_GROUP_CHAT_ERROR,
  payload: { groupId }
});

// // ==================== COMBINED API + SOCKET ACTIONS ====================

// // Send message with optimistic updates
// export const sendGroupMessageOptimistic = (groupId, messageData) => async (dispatch, getState) => {
//   const tempMessageId = `temp_${Date.now()}_${Math.random()}`;
//   const { auth: { user } } = getState();
  
//   // Create temporary message for optimistic update
//   const tempMessage = {
//     _id: tempMessageId,
//     groupId,
//     sender: {
//       _id: user._id,
//       email: user.email
//     },
//     content: messageData.content,
//     messageType: messageData.messageType || 'text',
//     timestamp: new Date(),
//     tempMessage: true,
//     sending: true,
//     ...messageData
//   };
  
//   // Add message optimistically
//   dispatch(addGroupMessage(groupId, tempMessage));
  
//   try {
//     // Send via API first (fallback)
//     const response = await dispatch(sendMessage(groupId, messageData));
    
//     // Update temp message with real message data
//     dispatch(updateGroupMessage(groupId, tempMessageId, {
//       ...response.data.data,
//       tempMessage: false,
//       sending: false
//     }));
    
//     return response;
//   } catch (error) {
//     // Mark message as failed
//     dispatch(updateGroupMessage(groupId, tempMessageId, {
//       sending: false,
//       failed: true,
//       error: handleError(error)
//     }));
//     throw error;
//   }
// };

// // Edit message with optimistic updates
// export const editGroupMessageOptimistic = (groupId, messageId, content) => async (dispatch) => {
//   // Update message optimistically
//   dispatch(updateGroupMessage(groupId, messageId, {
//     content,
//     isEdited: true,
//     editedAt: new Date(),
//     editing: true
//   }));
  
//   try {
//     await dispatch(editMessage(groupId, messageId, content));
    
//     // Remove editing flag
//     dispatch(updateGroupMessage(groupId, messageId, {
//       editing: false
//     }));
//   } catch (error) {
//     // Revert on error - you'd need to store original content
//     dispatch(updateGroupMessage(groupId, messageId, {
//       editing: false,
//       editError: handleError(error)
//     }));
//     throw error;
//   }
// };

// // Delete message with optimistic updates
// export const deleteGroupMessageOptimistic = (groupId, messageId) => async (dispatch) => {
//   // Mark as deleting
//   dispatch(updateGroupMessage(groupId, messageId, {
//     deleting: true
//   }));
  
//   try {
//     await dispatch(deleteMessage(groupId, messageId));
    
//     // Remove message from UI
//     dispatch(removeGroupMessage(groupId, messageId));
//   } catch (error) {
//     // Revert on error
//     dispatch(updateGroupMessage(groupId, messageId, {
//       deleting: false,
//       deleteError: handleError(error)
//     }));
//     throw error;
//   }
// };

// // Add reaction with optimistic updates
// export const addGroupReactionOptimistic = (groupId, messageId, emoji) => async (dispatch, getState) => {
//   const { auth: { user } } = getState();
  
//   try {
//     await dispatch(addReaction(groupId, messageId, emoji));
//     // The socket event will handle the UI update
//   } catch (error) {
//     dispatch(setGroupChatError(groupId, handleError(error)));
//     throw error;
//   }
// };

// // Initialize group chat
// export const initializeGroupChat = (groupId) => async (dispatch) => {
//   try {
//     // Load initial messages
//     await dispatch(getChatMessages(groupId));
    
//     // Get unread count
//     await dispatch(getUnreadCount(groupId));
    
//     // Connect to real-time updates
//     dispatch(connectToGroupChat(groupId));
    
//   } catch (error) {
//     dispatch(setGroupChatError(groupId, handleError(error)));
//   }
// };

// // Cleanup group chat
// export const cleanupGroupChat = (groupId) => (dispatch) => {
//   dispatch(disconnectFromGroupChat(groupId));
//   dispatch(clearGroupTyping(groupId));
//   dispatch(clearGroupChatError(groupId));
// };

// Private Chat Actions (for compatibility with useSocket)
export const loadConversations = (conversations) => ({
  type: STUDY_GROUP_TYPES.LOAD_CONVERSATIONS,
  payload: conversations
});

export const loadMessages = (messages, hasMore) => ({
  type: STUDY_GROUP_TYPES.LOAD_MESSAGES,
  payload: { messages, hasMore }
});

export const addMessage = (message) => ({
  type: STUDY_GROUP_TYPES.ADD_MESSAGE,
  payload: message
});

export const messageSent = (message) => ({
  type: STUDY_GROUP_TYPES.MESSAGE_SENT,
  payload: message
});

export const setTyping = (userId) => ({
  type: STUDY_GROUP_TYPES.SET_TYPING,
  payload: userId
});

export const clearTyping = (userId) => ({
  type: STUDY_GROUP_TYPES.CLEAR_TYPING,
  payload: userId
});

export const updateOnlineUsers = (users) => ({
  type: STUDY_GROUP_TYPES.UPDATE_ONLINE_USERS,
  payload: users
});

export const userConnected = (userId) => ({
  type: STUDY_GROUP_TYPES.USER_CONNECTED,
  payload: userId
});

export const userDisconnected = (userId) => ({
  type: STUDY_GROUP_TYPES.USER_DISCONNECTED,
  payload: userId
});

export const chatError = (error) => ({
  type: STUDY_GROUP_TYPES.CHAT_ERROR,
  payload: error
});