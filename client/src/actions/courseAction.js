import axios from 'axios';
import {
  GET_COURSES_REQUEST,
  GET_COURSES_SUCCESS,
  GET_COURSES_FAIL,
  GET_COURSE_REQUEST,
  GET_COURSE_SUCCESS,
  GET_COURSE_FAIL,
  CREATE_COURSE_REQUEST,
  CREATE_COURSE_SUCCESS,
  CREATE_COURSE_FAIL,
  UPDATE_COURSE_REQUEST,
  UPDATE_COURSE_SUCCESS,
  UPDATE_COURSE_FAIL,
  DELETE_COURSE_REQUEST,
  DELETE_COURSE_SUCCESS,
  DELETE_COURSE_FAIL,
  ENROLL_STUDENT_REQUEST,
  ENROLL_STUDENT_SUCCESS,
  ENROLL_STUDENT_FAIL,
  UNENROLL_STUDENT_REQUEST,
  UNENROLL_STUDENT_SUCCESS,
  UNENROLL_STUDENT_FAIL,
  GET_COURSE_STUDENTS_REQUEST,
  GET_COURSE_STUDENTS_SUCCESS,
  GET_COURSE_STUDENTS_FAIL,
  GET_COURSE_MODULES_REQUEST,
  GET_COURSE_MODULES_SUCCESS,
  GET_COURSE_MODULES_FAIL,
  UPDATE_COURSE_MODULE_REQUEST,
  UPDATE_COURSE_MODULE_SUCCESS,
  UPDATE_COURSE_MODULE_FAIL,
  ADD_COURSE_ANNOUNCEMENT_REQUEST,
  ADD_COURSE_ANNOUNCEMENT_SUCCESS,
  ADD_COURSE_ANNOUNCEMENT_FAIL,
  ADVANCED_COURSE_SEARCH_REQUEST,
  ADVANCED_COURSE_SEARCH_SUCCESS,
  ADVANCED_COURSE_SEARCH_FAIL,
  CLEAR_COURSE_ERRORS,
  CLEAR_COURSE_SUCCESS,
  SET_COURSE_LOADING,
  RESET_COURSE_STATE,
  
} from './types.js';


const setAuthToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    // Try both possible header formats
    axios.defaults.headers.common['x-auth-token'] = token;
   
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

// FIXED: Updated API endpoints to use consistent path
export const getCourses = (params = {}) => async (dispatch) => {
  dispatch({ type: GET_COURSES_REQUEST });
  
  try {
    setAuthToken();
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/api/courses?${queryString}` : '/api/courses'; 
    
    const res = await axios.get(url);
    
    dispatch({
      type: GET_COURSES_SUCCESS,
      payload: res.data
    });
  } catch (error) {
    console.error('getCourses error:', error.response?.data || error.message);
    dispatch({
      type: GET_COURSES_FAIL,
      payload: error.response?.data?.message || error.message
    });
  }
};

// FIXED: Updated path
export const getCourse = (courseId) => async (dispatch) => {
  dispatch({ type: GET_COURSE_REQUEST });
  
  try {
    setAuthToken();
    const res = await axios.get(`/api/courses/${courseId}`); // Fixed path
    
    dispatch({
      type: GET_COURSE_SUCCESS,
      payload: res.data.data
    });
  } catch (error) {
    console.error('getCourse error:', error.response?.data || error.message);
    dispatch({
      type: GET_COURSE_FAIL,
      payload: error.response?.data?.message || error.message
    });
  }
};

// enroll student
export const enrollStudent = (courseId, studentId) => async (dispatch) => {
  dispatch({ type: ENROLL_STUDENT_REQUEST });
  
  try {
    // Validation
    if (!courseId || !studentId) {
      throw new Error('Course ID and Student ID are required');
    }

    setAuthToken();
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    
    const res = await axios.post(`/api/courses/${courseId}/enroll`, { studentId }, config); 
    
    dispatch({
      type: ENROLL_STUDENT_SUCCESS,
      payload: res.data
    });
    
    return { success: true, data: res.data };
    
  } catch (error) {
    console.error('enrollStudent error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.message;
    
    dispatch({
      type: ENROLL_STUDENT_FAIL,
      payload: errorMessage
    });
    
    return { success: false, error: errorMessage };
  }
};

// FIXED: Updated path and enhanced error handling
export const advancedCourseSearch = (searchParams) => async (dispatch) => {
  dispatch({ type: ADVANCED_COURSE_SEARCH_REQUEST });
  
  try {
    setAuthToken();
    const queryString = new URLSearchParams(searchParams).toString();
    const res = await axios.get(`/api/courses/search/advanced?${queryString}`); // Fixed path
    
    dispatch({
      type: ADVANCED_COURSE_SEARCH_SUCCESS,
      payload: res.data
    });
  } catch (error) {
    console.error('advancedCourseSearch error:', error.response?.data || error.message);
    dispatch({
      type: ADVANCED_COURSE_SEARCH_FAIL,
      payload: error.response?.data?.message || error.message
    });
  }
};

// Update other functions with consistent paths and error handling...
export const createCourse = (courseData) => async (dispatch) => {
  dispatch({ type: CREATE_COURSE_REQUEST });
  
  try {
    setAuthToken();
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const res = await axios.post('/api/courses', courseData, config); // Fixed path
    
    dispatch({
      type: CREATE_COURSE_SUCCESS,
      payload: res.data
    });
  } catch (error) {
    console.error('createCourse error:', error.response?.data || error.message);
    dispatch({
      type: CREATE_COURSE_FAIL,
      payload: error.response?.data?.message || error.message
    });
  }
};

export const updateCourse = (courseId, courseData) => async (dispatch) => {
  dispatch({ type: UPDATE_COURSE_REQUEST });
  
  try {
    setAuthToken();
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const res = await axios.put(`/api/courses/${courseId}`, courseData, config); // Fixed path
    
    dispatch({
      type: UPDATE_COURSE_SUCCESS,
      payload: res.data
    });
  } catch (error) {
    console.error('updateCourse error:', error.response?.data || error.message);
    dispatch({
      type: UPDATE_COURSE_FAIL,
      payload: error.response?.data?.message || error.message
    });
  }
};

export const deleteCourse = (courseId) => async (dispatch) => {
  dispatch({ type: DELETE_COURSE_REQUEST });
  
  try {
    setAuthToken();
    const res = await axios.delete(`/api/courses/${courseId}`); // Fixed path
    
    dispatch({
      type: DELETE_COURSE_SUCCESS,
      payload: { courseId, message: res.data.message }
    });
  } catch (error) {
    console.error('deleteCourse error:', error.response?.data || error.message);
    dispatch({
      type: DELETE_COURSE_FAIL,
      payload: error.response?.data?.message || error.message
    });
  }
};

export const unenrollStudent = (courseId, studentId) => async (dispatch) => {
  dispatch({ type: UNENROLL_STUDENT_REQUEST });
  
  try {
    setAuthToken();
    const res = await axios.delete(`/api/courses/${courseId}/unenroll/${studentId}`); // Fixed path
    
    dispatch({
      type: UNENROLL_STUDENT_SUCCESS,
      payload: { courseId, studentId, message: res.data.message }
    });
  } catch (error) {
    console.error('unenrollStudent error:', error.response?.data || error.message);
    dispatch({
      type: UNENROLL_STUDENT_FAIL,
      payload: error.response?.data?.message || error.message
    });
  }
};

export const getCourseStudents = (courseId) => async (dispatch) => {
  dispatch({ type: GET_COURSE_STUDENTS_REQUEST });
  
  try {
    setAuthToken();
    const res = await axios.get(`/api/courses/${courseId}/students`); // Fixed path
    
    dispatch({
      type: GET_COURSE_STUDENTS_SUCCESS,
      payload: { courseId, students: res.data.data, count: res.data.count }
    });
  } catch (error) {
    console.error('getCourseStudents error:', error.response?.data || error.message);
    dispatch({
      type: GET_COURSE_STUDENTS_FAIL,
      payload: error.response?.data?.message || error.message
    });
  }
};

export const getCourseModules = (courseId) => async (dispatch) => {
  dispatch({ type: GET_COURSE_MODULES_REQUEST });
  
  try {
    setAuthToken();
    const res = await axios.get(`/api/courses/${courseId}/modules`); // Fixed path
    
    dispatch({
      type: GET_COURSE_MODULES_SUCCESS,
      payload: res.data.data
    });
  } catch (error) {
    console.error('getCourseModules error:', error.response?.data || error.message);
    dispatch({
      type: GET_COURSE_MODULES_FAIL,
      payload: error.response?.data?.message || error.message
    });
  }
};

export const updateCourseModule = (courseId, moduleIndex, moduleData) => async (dispatch) => {
  dispatch({ type: UPDATE_COURSE_MODULE_REQUEST });
  
  try {
    setAuthToken();
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const res = await axios.put(`/api/courses/${courseId}/modules/${moduleIndex}`, moduleData, config); // Fixed path
    
    dispatch({
      type: UPDATE_COURSE_MODULE_SUCCESS,
      payload: { courseId, moduleIndex, module: res.data.data, message: res.data.message }
    });
  } catch (error) {
    console.error('updateCourseModule error:', error.response?.data || error.message);
    dispatch({
      type: UPDATE_COURSE_MODULE_FAIL,
      payload: error.response?.data?.message || error.message
    });
  }
};

export const addCourseAnnouncement = (courseId, announcementData) => async (dispatch) => {
  dispatch({ type: ADD_COURSE_ANNOUNCEMENT_REQUEST });
  
  try {
    setAuthToken();
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const res = await axios.post(`/api/courses/${courseId}/announcements`, announcementData, config); // Fixed path
    
    dispatch({
      type: ADD_COURSE_ANNOUNCEMENT_SUCCESS,
      payload: { courseId, announcements: res.data.data, message: res.data.message }
    });
  } catch (error) {
    console.error('addCourseAnnouncement error:', error.response?.data || error.message);
    dispatch({
      type: ADD_COURSE_ANNOUNCEMENT_FAIL,
      payload: error.response?.data?.message || error.message
    });
  }
};

// Utility actions
export const clearCourseErrors = () => ({
  type: CLEAR_COURSE_ERRORS
});

export const clearCourseSuccess = () => ({
  type: CLEAR_COURSE_SUCCESS
});

export const setCourseLoading = (loading) => ({
  type: SET_COURSE_LOADING,
  payload: loading
});

export const resetCourseState = () => ({
  type: RESET_COURSE_STATE
});