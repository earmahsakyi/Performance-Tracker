// actions/deadlineActions.js
import axios from 'axios';
import {
  FETCH_DEADLINES_REQUEST,
  FETCH_DEADLINES_SUCCESS,
  FETCH_DEADLINES_FAIL,
  CREATE_DEADLINE_REQUEST,
  CREATE_DEADLINE_SUCCESS,
  CREATE_DEADLINE_FAIL,
  UPDATE_DEADLINE_REQUEST,
  UPDATE_DEADLINE_SUCCESS,
  UPDATE_DEADLINE_FAIL,
  DELETE_DEADLINE_REQUEST,
  DELETE_DEADLINE_SUCCESS,
  DELETE_DEADLINE_FAIL,
  FETCH_DEADLINE_BY_COURSE_ID_FAIL,
  FETCH_DEADLINE_BY_COURSE_ID_SUCCESS,
  FETCH_DEADLINE_BY_COURSE_ID_REQUEST
} from './types.js';


const getConfig = () => ({
  headers: {
    'x-auth-token': localStorage.getItem('token'), 
  },
});

// Fetch deadlines for student
export const fetchDeadlines = (studentId) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_DEADLINES_REQUEST });

    const { data } = await axios.get(`/api/deadlines/student/${studentId}`, getConfig());

    dispatch({
      type: FETCH_DEADLINES_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_DEADLINES_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};

// Create deadline (for instructor/admin)
export const createDeadline = (deadlineData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_DEADLINE_REQUEST });
    console.log(deadlineData)
    const { data } = await axios.post('/api/deadlines/create', deadlineData, getConfig());

    dispatch({
      type: CREATE_DEADLINE_SUCCESS,
      payload: data,
    });
    return {success:true, data}
  } catch (error) {
    dispatch({
      type: CREATE_DEADLINE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
      
    });
    const errorMessage = error.response && error.response.data.message
    ? error.response.data.message
    : error.message;
    console.log(errorMessage)
    return {success:false, error:errorMessage}
  }
  
};

// Update deadline
export const updateDeadline = (deadlineId, deadlineData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_DEADLINE_REQUEST });

    const { data } = await axios.put(`/api/deadlines/${deadlineId}`, deadlineData, getConfig());

    dispatch({
      type: UPDATE_DEADLINE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: UPDATE_DEADLINE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};

// Delete deadline
export const deleteDeadline = (deadlineId) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_DEADLINE_REQUEST });

    await axios.delete(`/api/deadlines/${deadlineId}`, getConfig());

    dispatch({
      type: DELETE_DEADLINE_SUCCESS,
      payload: deadlineId,
    });
  } catch (error) {
    dispatch({
      type: DELETE_DEADLINE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  };
}

//get deadline by course id
export const fetchDeadlineByCourseId = (courseId) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_DEADLINE_BY_COURSE_ID_REQUEST });
    const { data } = await axios.get(`/api/deadlines/course/${courseId}`, getConfig());

    dispatch({
      type: FETCH_DEADLINE_BY_COURSE_ID_SUCCESS,
      payload: data,
    });
    return {success:true, data}
  } catch (error) {
    dispatch({
      type: FETCH_DEADLINE_BY_COURSE_ID_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};



// Additional actions like fetch for instructor or all can be added similarly
// e.g., fetchInstructorDeadlines, fetchAllDeadlines