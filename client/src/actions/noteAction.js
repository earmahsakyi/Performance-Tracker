import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import {
  ADD_NOTE_REQUEST,
  ADD_NOTE_SUCCESS,
  ADD_NOTE_FAIL,
  UPDATE_NOTE_REQUEST,
  UPDATE_NOTE_SUCCESS,
  UPDATE_NOTE_FAIL,
  DELETE_NOTE_REQUEST,
  DELETE_NOTE_SUCCESS,
  DELETE_NOTE_FAIL,
  GET_NOTES_REQUEST,
  GET_NOTES_SUCCESS,
  GET_NOTES_FAIL,
  GET_NOTE_REQUEST,
  GET_NOTE_SUCCESS,
  GET_NOTE_FAIL,
} from "./types.js";


// Base URL
const API_URL = "/api/student";

// Add Note
export const addNote = (studentId, noteData) => async (dispatch) => {
  try {
    dispatch({ type: ADD_NOTE_REQUEST });
    setAuthToken();
    const { data } = await axios.post(`${API_URL}/${studentId}/notes`, noteData);
    dispatch({ type: ADD_NOTE_SUCCESS, payload: data.data });
    return {success: true, data: data.data}

  } catch (error) {
    dispatch({
      type: ADD_NOTE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Update Note
export const updateNote = (studentId, noteId, noteData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_NOTE_REQUEST });
    setAuthToken();
    const { data } = await axios.put(`${API_URL}/${studentId}/notes/${noteId}`, noteData);
    dispatch({ type: UPDATE_NOTE_SUCCESS, payload: data.data });
    return {success: true, data: data.data}
    
  } catch (error) {
    dispatch({
      type: UPDATE_NOTE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Delete Note
export const deleteNote = (studentId, noteId) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_NOTE_REQUEST });
    setAuthToken();
    await axios.delete(`${API_URL}/${studentId}/notes/${noteId}`);
    dispatch({ type: DELETE_NOTE_SUCCESS, payload: noteId });
  } catch (error) {
    dispatch({
      type: DELETE_NOTE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Get All Notes
export const getNotes = (studentId) => async (dispatch) => {
  try {
    dispatch({ type: GET_NOTES_REQUEST });
    setAuthToken();
    
    
   
    const { data } = await axios.get(`${API_URL}/${studentId}/notes`);
    
    
    dispatch({ type: GET_NOTES_SUCCESS, payload: data.data });
  } catch (error) {
    console.error("Get notes error:", error.response?.data || error.message);
    dispatch({
      type: GET_NOTES_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Get Single Note
export const getNoteById = (studentId, noteId) => async (dispatch) => {
  try {
    dispatch({ type: GET_NOTE_REQUEST });
    setAuthToken();
    const { data } = await axios.get(`${API_URL}/${studentId}/notes/${noteId}`);
    dispatch({ type: GET_NOTE_SUCCESS, payload: data.data });
  } catch (error) {
    dispatch({
      type: GET_NOTE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};
