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
} from '../actions/types.js';

const initialState = {
  deadlines: [],
  courseDeadlines: [],
  loading: false,
  error: null,
};

export const deadlineReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_DEADLINES_REQUEST:
    case CREATE_DEADLINE_REQUEST:
    case UPDATE_DEADLINE_REQUEST:
    case DELETE_DEADLINE_REQUEST:
    case FETCH_DEADLINE_BY_COURSE_ID_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FETCH_DEADLINE_BY_COURSE_ID_SUCCESS:
      return{
        ...state,
        loading: false,
        courseDeadlines: action.payload,
      }
    case FETCH_DEADLINE_BY_COURSE_ID_FAIL:
      return{
        ...state,
        loading: false,
        error: action.payload,
      }
    case FETCH_DEADLINES_SUCCESS:
      return {
        ...state,
        loading: false,
        deadlines: action.payload,
      };

    case CREATE_DEADLINE_SUCCESS:
      return {
        ...state,
        loading: false,
        deadlines: [...state.deadlines, action.payload],
      };

    case UPDATE_DEADLINE_SUCCESS:
      return {
        ...state,
        loading: false,
        deadlines: state.deadlines.map((deadline) =>
          deadline._id === action.payload._id ? action.payload : deadline
        ),
      };

    case DELETE_DEADLINE_SUCCESS:
      return {
        ...state,
        loading: false,
        deadlines: state.deadlines.filter((deadline) => deadline._id !== action.payload),
      };

    case FETCH_DEADLINES_FAIL:
    case CREATE_DEADLINE_FAIL:
    case UPDATE_DEADLINE_FAIL:
    case DELETE_DEADLINE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};