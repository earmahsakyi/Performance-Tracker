import axios from 'axios'; 
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
} from './types';

const API_BASE_URL = '/api/announcements';

// Helper: get config with auth
const getConfig = (getState) => {
  const config = { headers: { 'Content-Type': 'application/json' } };
  const { auth } = getState();
  if (auth && auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
};

// Fetch all announcements
export const fetchAnnouncements = (courseId = null) => async (dispatch, getState) => {
  try {
    dispatch({ type: GET_ANNOUNCEMENTS_REQUEST });

    let url = API_BASE_URL;
    if (courseId) {
      url += `?courseId=${courseId}`;
    }

    const { data } = await axios.get(url, getConfig(getState));

    dispatch({
      type: GET_ANNOUNCEMENTS_SUCCESS,
      payload: data.data,
    });
  } catch (error) {
    dispatch({
      type: GET_ANNOUNCEMENTS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Fetch single announcement by ID
export const fetchAnnouncementById = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: GET_ANNOUNCEMENT_BY_ID_REQUEST });

    const { data } = await axios.get(`${API_BASE_URL}/${id}`, getConfig(getState));

    dispatch({
      type: GET_ANNOUNCEMENT_BY_ID_SUCCESS,
      payload: data.data,
    });
  } catch (error) {
    dispatch({
      type: GET_ANNOUNCEMENT_BY_ID_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Create new announcement
export const createAnnouncement = (announcementData) => async (dispatch, getState) => {
  try {
    dispatch({ type: CREATE_ANNOUNCEMENT_REQUEST });

    const { data } = await axios.post(API_BASE_URL, announcementData, getConfig(getState));

    dispatch({
      type: CREATE_ANNOUNCEMENT_SUCCESS,
      payload: data.data,
    });

    // Refresh list
    dispatch(fetchAnnouncements());
  } catch (error) {
    dispatch({
      type: CREATE_ANNOUNCEMENT_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Delete announcement
export const deleteAnnouncement = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: DELETE_ANNOUNCEMENT_REQUEST });

    await axios.delete(`${API_BASE_URL}/${id}`, getConfig(getState));

    dispatch({
      type: DELETE_ANNOUNCEMENT_SUCCESS,
      payload: id,
    });

    // Refresh list
    dispatch(fetchAnnouncements());
  } catch (error) {
    dispatch({
      type: DELETE_ANNOUNCEMENT_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Clear errors
export const clearAnnouncementErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ANNOUNCEMENT_ERRORS });
};

// Reset state
export const resetAnnouncementState = () => (dispatch) => {
  dispatch({ type: RESET_ANNOUNCEMENT_STATE });
};
