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
  RESET_COURSE_STATE
} from '../actions/types.js';

const initialState = {
  // Course data
  courses: [],
  course: null,
  courseModules: null,
  courseStudents: [],
  searchResults: [],
  
  // Pagination and metadata
  currentPage: 1,
  totalPages: 1,
  totalCourses: 0,
  coursesPerPage: 10,
  
  // Loading states
  loading: false,
  coursesLoading: false,
  courseLoading: false,
  moduleLoading: false,
  studentLoading: false,
  enrollmentLoading: false,
  announcementLoading: false,
  searchLoading: false,
  
  // Success and error states
  success: null,
  error: null,
  
  // Operation specific states
  courseCreated: false,
  courseUpdated: false,
  courseDeleted: false,
  studentEnrolled: false,
  studentUnenrolled: false,
  moduleUpdated: false,
  announcementAdded: false
};

const courseReducer = (state = initialState, action) => {
  switch (action.type) {
    // Get Courses
    case GET_COURSES_REQUEST:
      return {
        ...state,
        coursesLoading: true,
        error: null
      };
    
    case GET_COURSES_SUCCESS:
      return {
        ...state,
        coursesLoading: false,
        courses: action.payload.data,
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        totalCourses: action.payload.total,
        error: null
      };
    
    case GET_COURSES_FAIL:
      return {
        ...state,
        coursesLoading: false,
        courses: [],
        error: action.payload
      };

    // Get Single Course
    case GET_COURSE_REQUEST:
      return {
        ...state,
        courseLoading: true,
        error: null
      };
    
    case GET_COURSE_SUCCESS:
      return {
        ...state,
        courseLoading: false,
        course: action.payload,
        error: null
      };
    
    case GET_COURSE_FAIL:
      return {
        ...state,
        courseLoading: false,
        course: null,
        error: action.payload
      };

    // Create Course
    case CREATE_COURSE_REQUEST:
      return {
        ...state,
        loading: true,
        courseCreated: false,
        error: null
      };
    
    case CREATE_COURSE_SUCCESS:
      return {
        ...state,
        loading: false,
        courseCreated: true,
        courses: [action.payload.data, ...state.courses],
        success: action.payload.message,
        error: null
      };
    
    case CREATE_COURSE_FAIL:
      return {
        ...state,
        loading: false,
        courseCreated: false,
        error: action.payload
      };

    // Update Course
    case UPDATE_COURSE_REQUEST:
      return {
        ...state,
        loading: true,
        courseUpdated: false,
        error: null
      };
    
    case UPDATE_COURSE_SUCCESS:
      return {
        ...state,
        loading: false,
        courseUpdated: true,
        course: action.payload.data,
        courses: state.courses.map(course =>
          course._id === action.payload.data._id ? action.payload.data : course
        ),
        success: action.payload.message,
        error: null
      };
    
    case UPDATE_COURSE_FAIL:
      return {
        ...state,
        loading: false,
        courseUpdated: false,
        error: action.payload
      };

    // Delete Course
    case DELETE_COURSE_REQUEST:
      return {
        ...state,
        loading: true,
        courseDeleted: false,
        error: null
      };
    
    case DELETE_COURSE_SUCCESS:
      return {
        ...state,
        loading: false,
        courseDeleted: true,
        courses: state.courses.filter(course => course._id !== action.payload.courseId),
        success: action.payload.message,
        error: null
      };
    
    case DELETE_COURSE_FAIL:
      return {
        ...state,
        loading: false,
        courseDeleted: false,
        error: action.payload
      };

    // Enroll Student
    case ENROLL_STUDENT_REQUEST:
      return {
        ...state,
        enrollmentLoading: true,
        studentEnrolled: false,
        error: null
      };
    
    case ENROLL_STUDENT_SUCCESS:
      return {
        ...state,
        enrollmentLoading: false,
        studentEnrolled: true,
        success: action.payload.message,
        error: null
      };
    
    case ENROLL_STUDENT_FAIL:
      return {
        ...state,
        enrollmentLoading: false,
        studentEnrolled: false,
        error: action.payload
      };

    // Unenroll Student
    case UNENROLL_STUDENT_REQUEST:
      return {
        ...state,
        enrollmentLoading: true,
        studentUnenrolled: false,
        error: null
      };
    
    case UNENROLL_STUDENT_SUCCESS:
      return {
        ...state,
        enrollmentLoading: false,
        studentUnenrolled: true,
        courseStudents: state.courseStudents.filter(
          student => student._id !== action.payload.studentId
        ),
        success: action.payload.message,
        error: null
      };
    
    case UNENROLL_STUDENT_FAIL:
      return {
        ...state,
        enrollmentLoading: false,
        studentUnenrolled: false,
        error: action.payload
      };

    // Get Course Students
    case GET_COURSE_STUDENTS_REQUEST:
      return {
        ...state,
        studentLoading: true,
        error: null
      };
    
    case GET_COURSE_STUDENTS_SUCCESS:
      return {
        ...state,
        studentLoading: false,
        courseStudents: action.payload.students,
        error: null
      };
    
    case GET_COURSE_STUDENTS_FAIL:
      return {
        ...state,
        studentLoading: false,
        courseStudents: [],
        error: action.payload
      };

    // Get Course Modules
    case GET_COURSE_MODULES_REQUEST:
      return {
        ...state,
        moduleLoading: true,
        error: null
      };
    
    case GET_COURSE_MODULES_SUCCESS:
      return {
        ...state,
        moduleLoading: false,
        courseModules: action.payload,
        error: null
      };
    
    case GET_COURSE_MODULES_FAIL:
      return {
        ...state,
        moduleLoading: false,
        courseModules: null,
        error: action.payload
      };

    // Update Course Module
    case UPDATE_COURSE_MODULE_REQUEST:
      return {
        ...state,
        moduleLoading: true,
        moduleUpdated: false,
        error: null
      };
    
    case UPDATE_COURSE_MODULE_SUCCESS:
      const updatedModules = state.courseModules ? {
        ...state.courseModules,
        modules: state.courseModules.modules.map((module, index) =>
          index === action.payload.moduleIndex ? action.payload.module : module
        )
      } : null;
      
      return {
        ...state,
        moduleLoading: false,
        moduleUpdated: true,
        courseModules: updatedModules,
        success: action.payload.message,
        error: null
      };
    
    case UPDATE_COURSE_MODULE_FAIL:
      return {
        ...state,
        moduleLoading: false,
        moduleUpdated: false,
        error: action.payload
      };

    // Add Course Announcement
    case ADD_COURSE_ANNOUNCEMENT_REQUEST:
      return {
        ...state,
        announcementLoading: true,
        announcementAdded: false,
        error: null
      };
    
    case ADD_COURSE_ANNOUNCEMENT_SUCCESS:
      return {
        ...state,
        announcementLoading: false,
        announcementAdded: true,
        course: state.course ? {
          ...state.course,
          announcements: action.payload.announcements
        } : null,
        success: action.payload.message,
        error: null
      };
    
    case ADD_COURSE_ANNOUNCEMENT_FAIL:
      return {
        ...state,
        announcementLoading: false,
        announcementAdded: false,
        error: action.payload
      };

    // Advanced Course Search
    case ADVANCED_COURSE_SEARCH_REQUEST:
      return {
        ...state,
        searchLoading: true,
        error: null
      };
    
    case ADVANCED_COURSE_SEARCH_SUCCESS:
      return {
        ...state,
        searchLoading: false,
        searchResults: action.payload.data,
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        totalCourses: action.payload.total,
        error: null
      };
    
    case ADVANCED_COURSE_SEARCH_FAIL:
      return {
        ...state,
        searchLoading: false,
        searchResults: [],
        error: action.payload
      };

    // Utility Actions
    case CLEAR_COURSE_ERRORS:
      return {
        ...state,
        error: null
      };

    case CLEAR_COURSE_SUCCESS:
      return {
        ...state,
        success: null,
        courseCreated: false,
        courseUpdated: false,
        courseDeleted: false,
        studentEnrolled: false,
        studentUnenrolled: false,
        moduleUpdated: false,
        announcementAdded: false
      };

    case SET_COURSE_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case RESET_COURSE_STATE:
      return {
        ...initialState
      };

    default:
      return state;
  }
};

export default courseReducer;