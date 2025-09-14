import { STUDY_GROUP_TYPES } from '../actions/types';

const initialState = {
  // Dashboard Data
  myGroups: [],
  recommendedGroups: [],
  upcomingSessions: [],
  groupStats: {
    groupsJoined: 0,
    studySessions: 0,
    hoursStudied: 0,
    fellowStudents: 0
  },
   groupChat: {
    onlineMembers: {},
    typing: {},
    connected: {},
    mentions: []
  },

  // Group Management
  currentGroup: null,
  groupSessions: {},
  sessionDetails: {},

  // My Sessions
  myUpcomingSessions: [],

  // Chat Data
  chatMessages: {},
  unreadCounts: {},
  searchResults: {},

  // Loading States
  loading: {
    myGroups: false,
    recommendedGroups: false,
    upcomingSessions: false,
    groupStats: false,
    createGroup: false,
    groupDetails: false,
    joinGroup: false,
    leaveGroup: false,
    createSession: false,
    groupSessions: false,
    myUpcomingSessions: false,
    sessionDetails: false,
    registerSession: false,
    markAttendance: false,
    updateSession: false,
    cancelSession: false,
    joinSession: false,
    chatMessages: false,
    sendMessage: false,
    editMessage: false,
    deleteMessage: false,
    addReaction: false,
    markRead: false,
    unreadCount: false,
    searchMessages: false
  },

  // Error States
  error: null,
  success: null
};

const studyGroupReducer = (state = initialState, action) => {
  switch (action.type) {
    case STUDY_GROUP_TYPES.GET_MY_GROUPS_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, myGroups: true },
        error: null
      };

    case STUDY_GROUP_TYPES.GET_MY_GROUPS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, myGroups: false },
        myGroups: action.payload,
        error: null
      };

    case STUDY_GROUP_TYPES.GET_MY_GROUPS_FAIL:
      return {
        ...state,
        loading: { ...state.loading, myGroups: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.GET_RECOMMENDED_GROUPS_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, recommendedGroups: true },
        error: null
      };

    case STUDY_GROUP_TYPES.GET_RECOMMENDED_GROUPS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, recommendedGroups: false },
        recommendedGroups: action.payload,
        error: null
      };

    case STUDY_GROUP_TYPES.GET_RECOMMENDED_GROUPS_FAIL:
      return {
        ...state,
        loading: { ...state.loading, recommendedGroups: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.GET_UPCOMING_SESSIONS_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, upcomingSessions: true },
        error: null
      };

    case STUDY_GROUP_TYPES.GET_UPCOMING_SESSIONS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, upcomingSessions: false },
        upcomingSessions: action.payload,
        error: null
      };

    case STUDY_GROUP_TYPES.GET_UPCOMING_SESSIONS_FAIL:
      return {
        ...state,
        loading: { ...state.loading, upcomingSessions: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.GET_GROUP_STATS_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, groupStats: true },
        error: null
      };

    case STUDY_GROUP_TYPES.GET_GROUP_STATS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, groupStats: false },
        groupStats: action.payload,
        error: null
      };

    case STUDY_GROUP_TYPES.GET_GROUP_STATS_FAIL:
      return {
        ...state,
        loading: { ...state.loading, groupStats: false },
        error: action.payload
      };


    case STUDY_GROUP_TYPES.CREATE_GROUP_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, createGroup: true },
        error: null
      };

    case STUDY_GROUP_TYPES.CREATE_GROUP_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, createGroup: false },
        myGroups: [...state.myGroups, action.payload],
        success: 'Group created successfully!',
        error: null
      };

    case STUDY_GROUP_TYPES.CREATE_GROUP_FAIL:
      return {
        ...state,
        loading: { ...state.loading, createGroup: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.GET_GROUP_DETAILS_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, groupDetails: true },
        error: null
      };

    case STUDY_GROUP_TYPES.GET_GROUP_DETAILS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, groupDetails: false },
        currentGroup: action.payload,
        error: null
      };

    case STUDY_GROUP_TYPES.GET_GROUP_DETAILS_FAIL:
      return {
        ...state,
        loading: { ...state.loading, groupDetails: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.JOIN_GROUP_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, joinGroup: true },
        error: null
      };

    case STUDY_GROUP_TYPES.JOIN_GROUP_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, joinGroup: false },
        myGroups: [...state.myGroups, action.payload.group],
        recommendedGroups: state.recommendedGroups.filter(
          group => group._id !== action.payload.groupId
        ),
        success: 'Successfully joined the group!',
        error: null
      };

    case STUDY_GROUP_TYPES.JOIN_GROUP_FAIL:
      return {
        ...state,
        loading: { ...state.loading, joinGroup: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.LEAVE_GROUP_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, leaveGroup: true },
        error: null
      };

    case STUDY_GROUP_TYPES.LEAVE_GROUP_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, leaveGroup: false },
        myGroups: state.myGroups.filter(group => group._id !== action.payload),
        success: 'Successfully left the group!',
        error: null
      };

    case STUDY_GROUP_TYPES.LEAVE_GROUP_FAIL:
      return {
        ...state,
        loading: { ...state.loading, leaveGroup: false },
        error: action.payload
      };

    
    case STUDY_GROUP_TYPES.CREATE_SESSION_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, createSession: true },
        error: null
      };

    case STUDY_GROUP_TYPES.CREATE_SESSION_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, createSession: false },
        success: 'Session created successfully!',
        error: null
      };

    case STUDY_GROUP_TYPES.CREATE_SESSION_FAIL:
      return {
        ...state,
        loading: { ...state.loading, createSession: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.GET_GROUP_SESSIONS_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, groupSessions: true },
        error: null
      };

    case STUDY_GROUP_TYPES.GET_GROUP_SESSIONS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, groupSessions: false },
        groupSessions: {
          ...state.groupSessions,
          [action.payload.groupId]: action.payload.sessions
        },
        error: null
      };

    case STUDY_GROUP_TYPES.GET_GROUP_SESSIONS_FAIL:
      return {
        ...state,
        loading: { ...state.loading, groupSessions: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.GET_MY_UPCOMING_SESSIONS_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, myUpcomingSessions: true },
        error: null
      };

    case STUDY_GROUP_TYPES.GET_MY_UPCOMING_SESSIONS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, myUpcomingSessions: false },
        myUpcomingSessions: action.payload,
        error: null
      };

    case STUDY_GROUP_TYPES.GET_MY_UPCOMING_SESSIONS_FAIL:
      return {
        ...state,
        loading: { ...state.loading, myUpcomingSessions: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.GET_SESSION_DETAILS_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, sessionDetails: true },
        error: null
      };

    case STUDY_GROUP_TYPES.GET_SESSION_DETAILS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, sessionDetails: false },
        sessionDetails: {
          ...state.sessionDetails,
          [action.payload._id]: action.payload
        },
        error: null
      };

    case STUDY_GROUP_TYPES.GET_SESSION_DETAILS_FAIL:
      return {
        ...state,
        loading: { ...state.loading, sessionDetails: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.REGISTER_FOR_SESSION_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, registerSession: true },
        error: null
      };

    case STUDY_GROUP_TYPES.REGISTER_FOR_SESSION_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, registerSession: false },
        sessionDetails: {
          ...state.sessionDetails,
          [action.payload.sessionId]: action.payload.session
        },
        success: 'Successfully registered for session!',
        error: null
      };

    case STUDY_GROUP_TYPES.REGISTER_FOR_SESSION_FAIL:
      return {
        ...state,
        loading: { ...state.loading, registerSession: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.MARK_ATTENDANCE_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, markAttendance: true },
        error: null
      };

    case STUDY_GROUP_TYPES.MARK_ATTENDANCE_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, markAttendance: false },
        sessionDetails: {
          ...state.sessionDetails,
          [action.payload.sessionId]: action.payload.session
        },
        success: 'Attendance marked successfully!',
        error: null
      };

    case STUDY_GROUP_TYPES.MARK_ATTENDANCE_FAIL:
      return {
        ...state,
        loading: { ...state.loading, markAttendance: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.UPDATE_SESSION_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, updateSession: true },
        error: null
      };

    case STUDY_GROUP_TYPES.UPDATE_SESSION_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, updateSession: false },
        sessionDetails: {
          ...state.sessionDetails,
          [action.payload.sessionId]: action.payload.session
        },
        success: 'Session updated successfully!',
        error: null
      };

    case STUDY_GROUP_TYPES.UPDATE_SESSION_FAIL:
      return {
        ...state,
        loading: { ...state.loading, updateSession: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.CANCEL_SESSION_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, cancelSession: true },
        error: null
      };

    case STUDY_GROUP_TYPES.CANCEL_SESSION_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, cancelSession: false },
        sessionDetails: {
          ...state.sessionDetails,
          [action.payload.sessionId]: action.payload.session
        },
        success: 'Session cancelled successfully!',
        error: null
      };

    case STUDY_GROUP_TYPES.CANCEL_SESSION_FAIL:
      return {
        ...state,
        loading: { ...state.loading, cancelSession: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.JOIN_SESSION_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, joinSession: true },
        error: null
      };

    case STUDY_GROUP_TYPES.JOIN_SESSION_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, joinSession: false },
        success: 'Joining session...',
        error: null
      };

    case STUDY_GROUP_TYPES.JOIN_SESSION_FAIL:
      return {
        ...state,
        loading: { ...state.loading, joinSession: false },
        error: action.payload
      };


    case STUDY_GROUP_TYPES.GET_CHAT_MESSAGES_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, chatMessages: true },
        error: null
      };

    case STUDY_GROUP_TYPES.GET_CHAT_MESSAGES_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, chatMessages: false },
        chatMessages: {
          ...state.chatMessages,
          [action.payload.groupId]: {
            messages: action.payload.messages,
            hasMore: action.payload.hasMore
          }
        },
        error: null
      };

    case STUDY_GROUP_TYPES.GET_CHAT_MESSAGES_FAIL:
      return {
        ...state,
        loading: { ...state.loading, chatMessages: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.SEND_MESSAGE_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, sendMessage: true },
        error: null
      };

    case STUDY_GROUP_TYPES.SEND_MESSAGE_SUCCESS:
      const groupId = action.payload.groupId;
      const newMessage = action.payload.message;
      const currentMessages = state.chatMessages[groupId]?.messages || [];
      
      return {
        ...state,
        loading: { ...state.loading, sendMessage: false },
        chatMessages: {
          ...state.chatMessages,
          [groupId]: {
            ...state.chatMessages[groupId],
            messages: [...currentMessages, newMessage]
          }
        },
        error: null
      };

    case STUDY_GROUP_TYPES.SEND_MESSAGE_FAIL:
      return {
        ...state,
        loading: { ...state.loading, sendMessage: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.EDIT_MESSAGE_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, editMessage: true },
        error: null
      };

    case STUDY_GROUP_TYPES.EDIT_MESSAGE_SUCCESS:
      const editGroupId = action.payload.groupId;
      const editMessageId = action.payload.messageId;
      const editContent = action.payload.content;
      const editMessages = state.chatMessages[editGroupId]?.messages || [];
      
      return {
        ...state,
        loading: { ...state.loading, editMessage: false },
        chatMessages: {
          ...state.chatMessages,
          [editGroupId]: {
            ...state.chatMessages[editGroupId],
            messages: editMessages.map(msg => 
              msg._id === editMessageId 
                ? { ...msg, content: editContent, isEdited: true, editedAt: new Date() }
                : msg
            )
          }
        },
        success: 'Message edited successfully!',
        error: null
      };

    case STUDY_GROUP_TYPES.EDIT_MESSAGE_FAIL:
      return {
        ...state,
        loading: { ...state.loading, editMessage: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.DELETE_MESSAGE_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, deleteMessage: true },
        error: null
      };

    case STUDY_GROUP_TYPES.DELETE_MESSAGE_SUCCESS:
      const deleteGroupId = action.payload.groupId;
      const deleteMessageId = action.payload.messageId;
      const deleteMessages = state.chatMessages[deleteGroupId]?.messages || [];
      
      return {
        ...state,
        loading: { ...state.loading, deleteMessage: false },
        chatMessages: {
          ...state.chatMessages,
          [deleteGroupId]: {
            ...state.chatMessages[deleteGroupId],
            messages: deleteMessages.filter(msg => msg._id !== deleteMessageId)
          }
        },
        success: 'Message deleted successfully!',
        error: null
      };

    case STUDY_GROUP_TYPES.DELETE_MESSAGE_FAIL:
      return {
        ...state,
        loading: { ...state.loading, deleteMessage: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.ADD_REACTION_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, addReaction: true },
        error: null
      };

    case STUDY_GROUP_TYPES.ADD_REACTION_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, addReaction: false },
        success: 'Reaction added!',
        error: null
      };

    case STUDY_GROUP_TYPES.ADD_REACTION_FAIL:
      return {
        ...state,
        loading: { ...state.loading, addReaction: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.MARK_MESSAGES_READ_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, markRead: true },
        error: null
      };

    case STUDY_GROUP_TYPES.MARK_MESSAGES_READ_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, markRead: false },
        error: null
      };

    case STUDY_GROUP_TYPES.MARK_MESSAGES_READ_FAIL:
      return {
        ...state,
        loading: { ...state.loading, markRead: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.GET_UNREAD_COUNT_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, unreadCount: true },
        error: null
      };

    case STUDY_GROUP_TYPES.GET_UNREAD_COUNT_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, unreadCount: false },
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload.groupId]: action.payload.unreadCount
        },
        error: null
      };

    case STUDY_GROUP_TYPES.GET_UNREAD_COUNT_FAIL:
      return {
        ...state,
        loading: { ...state.loading, unreadCount: false },
        error: action.payload
      };

    case STUDY_GROUP_TYPES.SEARCH_MESSAGES_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, searchMessages: true },
        error: null
      };

    case STUDY_GROUP_TYPES.SEARCH_MESSAGES_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, searchMessages: false },
        searchResults: {
          ...state.searchResults,
          [action.payload.groupId]: {
            query: action.payload.query,
            results: action.payload.searchResults
          }
        },
        error: null
      };

    case STUDY_GROUP_TYPES.SEARCH_MESSAGES_FAIL:
      return {
        ...state,
        loading: { ...state.loading, searchMessages: false },
        error: action.payload
      };

    
    case STUDY_GROUP_TYPES.CLEAR_ERRORS:
      return {
        ...state,
        error: null
      };

    case STUDY_GROUP_TYPES.CLEAR_SUCCESS:
      return {
        ...state,
        success: null
      };

    case STUDY_GROUP_TYPES.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          ...action.payload
        }
      };


      case STUDY_GROUP_TYPES.ADD_GROUP_MESSAGE:
  const { groupId: addMsgGroupId, message } = action.payload;
  const currentGroupMessages = state.chatMessages[addMsgGroupId]?.messages || [];
  
  return {
    ...state,
    chatMessages: {
      ...state.chatMessages,
      [addMsgGroupId]: {
        ...state.chatMessages[addMsgGroupId],
        messages: [...currentGroupMessages, message]
      }
    }
  };

case STUDY_GROUP_TYPES.UPDATE_GROUP_MESSAGE:
  const { groupId: updateMsgGroupId, messageId, updates } = action.payload;
  const updateMessages = state.chatMessages[updateMsgGroupId]?.messages || [];
  
  return {
    ...state,
    chatMessages: {
      ...state.chatMessages,
      [updateMsgGroupId]: {
        ...state.chatMessages[updateMsgGroupId],
        messages: updateMessages.map(msg => 
          msg._id === messageId ? { ...msg, ...updates } : msg
        )
      }
    }
  };

case STUDY_GROUP_TYPES.REMOVE_GROUP_MESSAGE:
  const { groupId: removeMsgGroupId, messageId: removeMessageId } = action.payload;
  const removeMessages = state.chatMessages[removeMsgGroupId]?.messages || [];
  
  return {
    ...state,
    chatMessages: {
      ...state.chatMessages,
      [removeMsgGroupId]: {
        ...state.chatMessages[removeMsgGroupId],
        messages: removeMessages.filter(msg => msg._id !== removeMessageId)
      }
    }
  };

case STUDY_GROUP_TYPES.SET_GROUP_TYPING:
  const { groupId: typingGroupId, userId: typingUserId, isTyping } = action.payload;
  
  return {
    ...state,
    groupChat: {
      ...state.groupChat,
      typing: {
        ...state.groupChat.typing,
        [typingGroupId]: {
          ...state.groupChat.typing[typingGroupId],
          [typingUserId]: isTyping
        }
      }
    }
  };

case STUDY_GROUP_TYPES.CLEAR_GROUP_TYPING:
  const { groupId: clearTypingGroupId, userId: clearTypingUserId } = action.payload;
  const groupTyping = { ...state.groupChat.typing[clearTypingGroupId] };
  delete groupTyping[clearTypingUserId];
  
  return {
    ...state,
    groupChat: {
      ...state.groupChat,
      typing: {
        ...state.groupChat.typing,
        [clearTypingGroupId]: groupTyping
      }
    }
  };

case STUDY_GROUP_TYPES.SET_GROUP_ONLINE_MEMBERS:
  const { groupId: onlineGroupId, onlineMembers } = action.payload;
  
  return {
    ...state,
    groupChat: {
      ...state.groupChat,
      onlineMembers: {
        ...state.groupChat.onlineMembers,
        [onlineGroupId]: onlineMembers
      }
    }
  };

case STUDY_GROUP_TYPES.ADD_GROUP_ONLINE_MEMBER:
  const { groupId: addOnlineGroupId, userId: addOnlineUserId } = action.payload;
  const currentOnlineMembers = state.groupChat.onlineMembers[addOnlineGroupId] || [];
  
  if (!currentOnlineMembers.includes(addOnlineUserId)) {
    return {
      ...state,
      groupChat: {
        ...state.groupChat,
        onlineMembers: {
          ...state.groupChat.onlineMembers,
          [addOnlineGroupId]: [...currentOnlineMembers, addOnlineUserId]
        }
      }
    };
  }
  return state;

case STUDY_GROUP_TYPES.REMOVE_GROUP_ONLINE_MEMBER:
  const { groupId: removeOnlineGroupId, userId: removeOnlineUserId } = action.payload;
  const filteredOnlineMembers = (state.groupChat.onlineMembers[removeOnlineGroupId] || [])
    .filter(id => id !== removeOnlineUserId);
  
  return {
    ...state,
    groupChat: {
      ...state.groupChat,
      onlineMembers: {
        ...state.groupChat.onlineMembers,
        [removeOnlineGroupId]: filteredOnlineMembers
      }
    }
  };

case STUDY_GROUP_TYPES.UPDATE_GROUP_MESSAGE_REACTIONS:
  const { groupId: reactionGroupId, messageId: reactionMessageId, reactions } = action.payload;
  const reactionMessages = state.chatMessages[reactionGroupId]?.messages || [];
  
  return {
    ...state,
    chatMessages: {
      ...state.chatMessages,
      [reactionGroupId]: {
        ...state.chatMessages[reactionGroupId],
        messages: reactionMessages.map(msg => 
          msg._id === reactionMessageId ? { ...msg, reactions } : msg
        )
      }
    }
  };

case STUDY_GROUP_TYPES.UPDATE_GROUP_MESSAGE_READ_STATUS:
  const { groupId: readStatusGroupId, messageIds, readBy, readAt } = action.payload;
  const readStatusMessages = state.chatMessages[readStatusGroupId]?.messages || [];
  
  return {
    ...state,
    chatMessages: {
      ...state.chatMessages,
      [readStatusGroupId]: {
        ...state.chatMessages[readStatusGroupId],
        messages: readStatusMessages.map(msg => 
          messageIds.includes(msg._id) 
            ? { 
                ...msg, 
                readBy: [...(msg.readBy || []), { userId: readBy, readAt }] 
              } 
            : msg
        )
      }
    }
  };

case STUDY_GROUP_TYPES.ADD_GROUP_MENTION:
  return {
    ...state,
    groupChat: {
      ...state.groupChat,
      mentions: [...state.groupChat.mentions, action.payload]
    }
  };

case STUDY_GROUP_TYPES.SET_GROUP_CHAT_CONNECTED:
  const { groupId: connectedGroupId, isConnected } = action.payload;
  
  return {
    ...state,
    groupChat: {
      ...state.groupChat,
      connected: {
        ...state.groupChat.connected,
        [connectedGroupId]: isConnected
      }
    }
  };

case STUDY_GROUP_TYPES.SET_GROUP_CHAT_ERROR:
  return {
    ...state,
    error: action.payload
  };

case STUDY_GROUP_TYPES.CLEAR_GROUP_CHAT_ERROR:
  return {
    ...state,
    error: null
  };

    case STUDY_GROUP_TYPES.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

export default studyGroupReducer;