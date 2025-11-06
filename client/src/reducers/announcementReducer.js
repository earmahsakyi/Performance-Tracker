import {
  GET_ANNOUNCEMENTS_REQUEST,
  GET_ANNOUNCEMENTS_SUCCESS,
  GET_ANNOUNCEMENTS_FAIL,
  CREATE_ANNOUNCEMENT_REQUEST,
  CREATE_ANNOUNCEMENT_SUCCESS,
  CREATE_ANNOUNCEMENT_FAIL,
  DELETE_ANNOUNCEMENT_REQUEST,
  DELETE_ANNOUNCEMENT_SUCCESS,
  DELETE_ANNOUNCEMENT_FAIL,
  GET_ANNOUNCEMENT_BY_ID_REQUEST,
  GET_ANNOUNCEMENT_BY_ID_SUCCESS,
  GET_ANNOUNCEMENT_BY_ID_FAIL,
  CLEAR_ANNOUNCEMENT_ERRORS,
  RESET_ANNOUNCEMENT_STATE
} from '../actions/types';

const initialState = {
  announcements: [],
  selectedAnnouncement: null,
  loading: false,
  error: null,
  creating: false,
  createError: null,
  deleting: false,
  deleteError: null,
  fetchingById: false,
  fetchByIdError: null,
  success: false,
};

export const announcementReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch all announcements
    case GET_ANNOUNCEMENTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_ANNOUNCEMENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        announcements: action.payload,
        error: null,
      };

    case GET_ANNOUNCEMENTS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Fetch single announcement by ID
    case GET_ANNOUNCEMENT_BY_ID_REQUEST:
      return {
        ...state,
        fetchingById: true,
        fetchByIdError: null,
      };

    case GET_ANNOUNCEMENT_BY_ID_SUCCESS:
      return {
        ...state,
        fetchingById: false,
        selectedAnnouncement: action.payload,
        fetchByIdError: null,
      };

    case GET_ANNOUNCEMENT_BY_ID_FAIL:
      return {
        ...state,
        fetchingById: false,
        fetchByIdError: action.payload,
      };

    // Create announcement
    case CREATE_ANNOUNCEMENT_REQUEST:
      return {
        ...state,
        creating: true,
        createError: null,
        success: false,
      };

    case CREATE_ANNOUNCEMENT_SUCCESS:
      return {
        ...state,
        creating: false,
        announcements: [action.payload, ...state.announcements],
        createError: null,
        success: true,
      };

    case CREATE_ANNOUNCEMENT_FAIL:
      return {
        ...state,
        creating: false,
        createError: action.payload,
        success: false,
      };

    // Delete announcement
    case DELETE_ANNOUNCEMENT_REQUEST:
      return {
        ...state,
        deleting: true,
        deleteError: null,
      };

    case DELETE_ANNOUNCEMENT_SUCCESS:
      return {
        ...state,
        deleting: false,
        announcements: state.announcements.filter(
          (announcement) => announcement._id !== action.payload
        ),
        deleteError: null,
        success: true,
      };

    case DELETE_ANNOUNCEMENT_FAIL:
      return {
        ...state,
        deleting: false,
        deleteError: action.payload,
      };

    // Clear errors
    case CLEAR_ANNOUNCEMENT_ERRORS:
      return {
        ...state,
        error: null,
        createError: null,
        deleteError: null,
        fetchByIdError: null,
      };

    // Reset state
    case RESET_ANNOUNCEMENT_STATE:
      return initialState;

    default:
      return state;
  }
};