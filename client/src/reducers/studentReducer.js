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
} from '../actions/types.js';

const initialState = {
  students: [],
  currentStudent: null,
  userStudent: null,
  loading: false,
  error: null,
  success: false,
  message: '',
  pagination: {
    currentPage: 1,
    totalPages: 0,
    total: 0,
    count: 0
  }
};

const studentReducer = (state = initialState, action) => {
  switch (action.type) {
    // Create Student
    case CREATE_STUDENT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
        message: ''
      };

    case CREATE_STUDENT_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        currentStudent: action.payload.data,
        userStudent: action.payload.data,
        message: action.payload.message,
        error: null
      };

    case CREATE_STUDENT_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
        message: ''
      };

    // Get Students
    case GET_STUDENTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_STUDENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        students: action.payload.data,
        pagination: {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
          count: action.payload.count
        },
        error: null
      };

    case GET_STUDENTS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
        students: []
      };

    // Get Student by ID
    case GET_STUDENT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_STUDENT_SUCCESS:
      return {
        ...state,
        loading: false,
        currentStudent: action.payload,
        error: null
      };

    case GET_STUDENT_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
        currentStudent: null
      };

    // Update Student
    case UPDATE_STUDENT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
        message: ''
      };

    case UPDATE_STUDENT_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        currentStudent: action.payload.data,
        userStudent: state.userStudent && state.userStudent._id === action.payload.data._id 
          ? action.payload.data 
          : state.userStudent,
        students: state.students.map(student =>
          student._id === action.payload.data._id ? action.payload.data : student
        ),
        message: action.payload.message,
        error: null
      };

    case UPDATE_STUDENT_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
        message: ''
      };

    // Delete Student
    case DELETE_STUDENT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case DELETE_STUDENT_SUCCESS:
      return {
        ...state,
        loading: false,
        students: state.students.filter(student => student._id !== action.payload),
        currentStudent: state.currentStudent && state.currentStudent._id === action.payload 
          ? null 
          : state.currentStudent,
        userStudent: state.userStudent && state.userStudent._id === action.payload 
          ? null 
          : state.userStudent,
        error: null
      };

    case DELETE_STUDENT_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // Get Student by User ID
    case GET_STUDENT_BY_USER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_STUDENT_BY_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        userStudent: action.payload,
        error: null
      };

    case GET_STUDENT_BY_USER_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
        userStudent: null
      };

    // Add Performance Score
    case ADD_PERFORMANCE_SCORE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case ADD_PERFORMANCE_SCORE_SUCCESS:
      const { studentId: perfStudentId, performanceScores } = action.payload;
      return {
        ...state,
        loading: false,
        currentStudent: state.currentStudent && state.currentStudent._id === perfStudentId
          ? { ...state.currentStudent, performanceScores }
          : state.currentStudent,
        userStudent: state.userStudent && state.userStudent._id === perfStudentId
          ? { ...state.userStudent, performanceScores }
          : state.userStudent,
        students: state.students.map(student =>
          student._id === perfStudentId
            ? { ...student, performanceScores }
            : student
        ),
        error: null
      };

    case ADD_PERFORMANCE_SCORE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // Update Course Progress
    case UPDATE_COURSE_PROGRESS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case UPDATE_COURSE_PROGRESS_SUCCESS:
      const { studentId: progStudentId, courseId, progress } = action.payload;
      
      const updateEnrolledCourses = (courses) => {
        return courses.map(course =>
          course.courseId._id === courseId || course.courseId === courseId
            ? { ...course, progress: progress.progress, certificateIssued: progress.certificateIssued }
            : course
        );
      };

      return {
        ...state,
        loading: false,
        currentStudent: state.currentStudent && state.currentStudent._id === progStudentId
          ? { 
              ...state.currentStudent, 
              enrolledCourses: updateEnrolledCourses(state.currentStudent.enrolledCourses) 
            }
          : state.currentStudent,
        userStudent: state.userStudent && state.userStudent._id === progStudentId
          ? { 
              ...state.userStudent, 
              enrolledCourses: updateEnrolledCourses(state.userStudent.enrolledCourses) 
            }
          : state.userStudent,
        students: state.students.map(student =>
          student._id === progStudentId
            ? { 
                ...student, 
                enrolledCourses: updateEnrolledCourses(student.enrolledCourses) 
              }
            : student
        ),
        error: null
      };

    case UPDATE_COURSE_PROGRESS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // Set Current Student
    case SET_CURRENT_STUDENT:
      return {
        ...state,
        currentStudent: action.payload
      };

    // Clear Current Student
    case CLEAR_CURRENT_STUDENT:
      return {
        ...state,
        currentStudent: null
      };

    // Clear Errors
    case CLEAR_STUDENT_ERRORS:
      return {
        ...state,
        error: null,
        success: false,
        message: ''
      };

    // Reset State
    case RESET_STUDENT_STATE:
      return initialState;

    default:
      return state;
  }
};

export default studentReducer;