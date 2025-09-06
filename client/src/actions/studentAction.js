import axios from 'axios';
import {
  CREATE_STUDENT_REQUEST,
  CREATE_STUDENT_SUCCESS,
  CREATE_STUDENT_FAIL,
  GET_STUDENTS_REQUEST,
  GET_STUDENTS_SUCCESS,
  GET_STUDENTS_FAIL,
  GET_STUDENT_REQUEST,
  GET_STUDENT_SUCCESS,
  GET_STUDENT_FAIL,
  UPDATE_STUDENT_REQUEST,
  UPDATE_STUDENT_SUCCESS,
  UPDATE_STUDENT_FAIL,
  DELETE_STUDENT_REQUEST,
  DELETE_STUDENT_SUCCESS,
  DELETE_STUDENT_FAIL,
  GET_STUDENT_BY_USER_REQUEST,
  GET_STUDENT_BY_USER_SUCCESS,
  GET_STUDENT_BY_USER_FAIL,
  ADD_PERFORMANCE_SCORE_REQUEST,
  ADD_PERFORMANCE_SCORE_SUCCESS,
  ADD_PERFORMANCE_SCORE_FAIL,
  UPDATE_COURSE_PROGRESS_REQUEST,
  UPDATE_COURSE_PROGRESS_SUCCESS,
  UPDATE_COURSE_PROGRESS_FAIL,
  CLEAR_STUDENT_ERRORS,
  SET_CURRENT_STUDENT,
  CLEAR_CURRENT_STUDENT,
  RESET_STUDENT_STATE
} from './types.js';

// Helper function to get auth config
const getConfig = (token) => ({
  headers: {
    'Content-Type': 'application/json',
    'x-auth-token': token
  }
});

// Helper function for form data config
const getFormDataConfig = (token) => ({
  headers: {
    'x-auth-token': token,
    'Content-Type': 'multipart/form-data'
  }
});

// Create student profile
export const createStudent = (studentData, token) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_STUDENT_REQUEST });

    const formData = new FormData();
    
    // Append all text fields
    Object.keys(studentData).forEach(key => {
      if (key !== 'photo' && studentData[key] !== null && studentData[key] !== undefined) {
        formData.append(key, studentData[key]);
      }
    });

    // Append photo if exists
    if (studentData.photo) {
      formData.append('photo', studentData.photo);
    }

    const config = getFormDataConfig(token);
    const res = await axios.post('/api/student', formData, config);

    dispatch({
      type: CREATE_STUDENT_SUCCESS,
      payload: res.data
    });

    return res.data;
  } catch (error) {
    dispatch({
      type: CREATE_STUDENT_FAIL,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Get all students with optional filters
export const getStudents = (filters = {}, token) => async (dispatch) => {
  try {
    dispatch({ type: GET_STUDENTS_REQUEST });

    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const config = getConfig(token);
    const res = await axios.get(
      `/api/student?${params.toString()}`, 
      config
    );

    dispatch({
      type: GET_STUDENTS_SUCCESS,
      payload: res.data
    });

    return res.data;
  } catch (error) {
    dispatch({
      type: GET_STUDENTS_FAIL,
      payload: error.response?.data?.message || error.message
    });
  }
};

// Get single student by ID
export const getStudentById = (studentId, token) => async (dispatch) => {
  try {
    dispatch({ type: GET_STUDENT_REQUEST });

    const config = getConfig(token);
    const res = await axios.get(`/api/student/${studentId}`, config);

    dispatch({
      type: GET_STUDENT_SUCCESS,
      payload: res.data.data
    });

    return res.data.data;
  } catch (error) {
    dispatch({
      type: GET_STUDENT_FAIL,
      payload: error.response?.data?.message || error.message
    });
  }
};

// Update student profile
export const updateStudent = (studentId, updateData, token) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_STUDENT_REQUEST });

    const formData = new FormData();
    
    // Append all text fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'photo' && updateData[key] !== null && updateData[key] !== undefined) {
        if (Array.isArray(updateData[key])) {
          formData.append(key, JSON.stringify(updateData[key]));
        } else {
          formData.append(key, updateData[key]);
        }
      }
    });

    // Append photo if exists
    if (updateData.photo) {
      formData.append('photo', updateData.photo);
    }

    const config = getFormDataConfig(token);
    const res = await axios.put(`/api/student/${studentId}`, formData, config);

    dispatch({
      type: UPDATE_STUDENT_SUCCESS,
      payload: res.data
    });

    return res.data;
  } catch (error) {
    dispatch({
      type: UPDATE_STUDENT_FAIL,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Delete student profile
export const deleteStudent = (studentId, token) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_STUDENT_REQUEST });

    const config = getConfig(token);
    await axios.delete(`/api/student/${studentId}`, config);

    dispatch({
      type: DELETE_STUDENT_SUCCESS,
      payload: studentId
    });
  } catch (error) {
    dispatch({
      type: DELETE_STUDENT_FAIL,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Get student by user ID
export const getStudentByUserId = (userId, token) => async (dispatch) => {
  try {
    dispatch({ type: GET_STUDENT_BY_USER_REQUEST });

    const config = getConfig(token);
    const res = await axios.get(`/api/student/user/${userId}`, config);

    dispatch({
      type: GET_STUDENT_BY_USER_SUCCESS,
      payload: res.data.data
    });

    return res.data.data;
  } catch (error) {
    dispatch({
      type: GET_STUDENT_BY_USER_FAIL,
      payload: error.response?.data?.message || error.message
    });
  }
};

// Add performance score
export const addPerformanceScore = (studentId, scoreData, token) => async (dispatch) => {
  try {
    dispatch({ type: ADD_PERFORMANCE_SCORE_REQUEST });

    const config = getConfig(token);
    const res = await axios.post(
      `/api/student/${studentId}/performance`, 
      scoreData, 
      config
    );

    dispatch({
      type: ADD_PERFORMANCE_SCORE_SUCCESS,
      payload: { studentId, performanceScores: res.data.data }
    });

    return res.data;
  } catch (error) {
    dispatch({
      type: ADD_PERFORMANCE_SCORE_FAIL,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Update course progress
export const updateCourseProgress = (studentId, courseId, progressData, token) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_COURSE_PROGRESS_REQUEST });

    const config = getConfig(token);
    const res = await axios.put(
      `/api/student/${studentId}/progress/${courseId}`, 
      progressData, 
      config
    );

    dispatch({
      type: UPDATE_COURSE_PROGRESS_SUCCESS,
      payload: { studentId, courseId, progress: res.data.data }
    });

    return res.data;
  } catch (error) {
    dispatch({
      type: UPDATE_COURSE_PROGRESS_FAIL,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Set current student
export const setCurrentStudent = (student) => (dispatch) => {
  dispatch({
    type: SET_CURRENT_STUDENT,
    payload: student
  });
};

// Clear current student
export const clearCurrentStudent = () => (dispatch) => {
  dispatch({ type: CLEAR_CURRENT_STUDENT });
};

// Clear errors
export const clearStudentErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_STUDENT_ERRORS });
};

// Reset student state
export const resetStudentState = () => (dispatch) => {
  dispatch({ type: RESET_STUDENT_STATE });
};