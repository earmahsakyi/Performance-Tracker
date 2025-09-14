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
  RESET_STUDENT_STATE,
  SUBMIT_ASSIGNMENT_REQUEST,
  SUBMIT_ASSIGNMENT_SUCCESS,
  SUBMIT_ASSIGNMENT_FAIL,
  GET_ASSIGNMENTS_REQUEST,
  GET_ASSIGNMENTS_SUCCESS,
  GET_ASSIGNMENTS_FAIL,
  SUBMIT_QUIZ_REQUEST,
  SUBMIT_QUIZ_SUCCESS,
  SUBMIT_QUIZ_FAIL,
  MARK_MODULE_COMPLETE_REQUEST,
  MARK_MODULE_COMPLETE_SUCCESS,
  MARK_MODULE_COMPLETE_FAIL,
  GET_PROGRESS_DETAILS_REQUEST,
  GET_PROGRESS_DETAILS_SUCCESS,
  GET_PROGRESS_DETAILS_FAIL,
  GET_WEEKLY_ACTIVITY_FAIL,
  GET_WEEKLY_ACTIVITY_SUCCESS,
  GET_WEEKLY_ACTIVITY_REQUEST,
  GET_STUDENT_STATS_REQUEST,
  GET_STUDENT_STATS_SUCCESS,
  GET_STUDENT_STATS_FAIL,
} from '../actions/types.js';

const initialState = {
  students: [],
  currentStudent: null,
  userStudent: null,
  loading: false,
  studentStats: null,     
  weeklyActivity: [],
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
      ? { ...state.currentStudent, performanceScores: performanceScores || [] }
      : state.currentStudent,
    userStudent: state.userStudent && state.userStudent._id === perfStudentId
      ? { ...state.userStudent, performanceScores: performanceScores || [] }
      : state.userStudent,
    students: state.students.map(student =>
      student._id === perfStudentId
        ? { ...student, performanceScores: performanceScores || [] }
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
    return courses.map(course => {
      if (!course || !course.courseId) return course;
      
      const courseIdValue = course.courseId._id || course.courseId;
      return courseIdValue.toString() === courseId
        ? { ...course, progress: progress.progress, certificateIssued: progress.certificateIssued }
        : course;
    });
  };

  return {
    ...state,
    loading: false,
    currentStudent: state.currentStudent && state.currentStudent._id === progStudentId
      ? { 
          ...state.currentStudent, 
          enrolledCourses: updateEnrolledCourses(state.currentStudent.enrolledCourses || []) 
        }
      : state.currentStudent,
    userStudent: state.userStudent && state.userStudent._id === progStudentId
      ? { 
          ...state.userStudent, 
          enrolledCourses: updateEnrolledCourses(state.userStudent.enrolledCourses || []) 
        }
      : state.userStudent,
    students: state.students.map(student =>
      student._id === progStudentId
        ? { 
            ...student, 
            enrolledCourses: updateEnrolledCourses(student.enrolledCourses || []) 
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

      // Add these cases to the switch statement

// Submit Assignment
case SUBMIT_ASSIGNMENT_REQUEST:
  return {
    ...state,
    loading: true,
    error: null
  };



  case SUBMIT_ASSIGNMENT_SUCCESS:
  const { studentId: assignStudentId, assignment } = action.payload;
  
  const updateStudentAssignments = (student) => {
    if (!student) return student;
    
    const assignmentIndex = student.assignments?.findIndex(
      a => a && a.courseId === assignment.courseId && 
           a.moduleIndex === assignment.moduleIndex && 
           a.assignmentIndex === assignment.assignmentIndex
    ) || -1;
    
    let newAssignments = [...(student.assignments || [])];
    if (assignmentIndex > -1) {
      newAssignments[assignmentIndex] = assignment;
    } else {
      newAssignments.push(assignment);
    }
    
    return { ...student, assignments: newAssignments };
  };

  return {
    ...state,
    loading: false,
    currentStudent: state.currentStudent && state.currentStudent._id === assignStudentId
      ? updateStudentAssignments(state.currentStudent)
      : state.currentStudent,
    userStudent: state.userStudent && state.userStudent._id === assignStudentId
      ? updateStudentAssignments(state.userStudent)
      : state.userStudent,
    error: null
  };

case SUBMIT_ASSIGNMENT_FAIL:
  return {
    ...state,
    loading: false,
    error: action.payload
  };

// Get Assignments
case GET_ASSIGNMENTS_REQUEST:
  return {
    ...state,
    loading: true,
    error: null
  };

case GET_ASSIGNMENTS_SUCCESS:
  // This action typically doesn't modify the state significantly
  // as assignments are already part of the student object
  return {
    ...state,
    loading: false,
    error: null
  };

case GET_ASSIGNMENTS_FAIL:
  return {
    ...state,
    loading: false,
    error: action.payload
  };

// Submit Quiz
case SUBMIT_QUIZ_REQUEST:
  return {
    ...state,
    loading: true,
    error: null
  };

case SUBMIT_QUIZ_SUCCESS:
  const { studentId: quizStudentId, quiz } = action.payload;
  
  const updateStudentPerformance = (student) => {
    if (!student) return student;
    return {
      ...student,
      performanceScores: [...(student.performanceScores || []), quiz]
    };
  };

  return {
    ...state,
    loading: false,
    currentStudent: state.currentStudent && state.currentStudent._id === quizStudentId
      ? updateStudentPerformance(state.currentStudent)
      : state.currentStudent,
    userStudent: state.userStudent && state.userStudent._id === quizStudentId
      ? updateStudentPerformance(state.userStudent)
      : state.userStudent,
    error: null
  };

case SUBMIT_QUIZ_FAIL:
  return {
    ...state,
    loading: false,
    error: action.payload
  };

// Mark Module Complete
case MARK_MODULE_COMPLETE_REQUEST:
  return {
    ...state,
    loading: true,
    error: null
  };

case MARK_MODULE_COMPLETE_SUCCESS:
  const { studentId: moduleStudentId, courseId: moduleCourseId, moduleIndex, progress: moduleProgress } = action.payload;
  
  const updateModuleCompletion = (courses) => {
    return courses.map(course => {
      // Add null/undefined checks
      if (!course || !course.courseId) return course;
      
      const courseId = course.courseId._id || course.courseId;
      if (courseId.toString() === moduleCourseId) {
        const completedModules = course.completedModules || [];
        const newCompletedModules = completedModules.includes(moduleIndex) 
          ? completedModules 
          : [...completedModules, moduleIndex];
        
        return {
          ...course,
          completedModules: newCompletedModules,
          progress: moduleProgress.progress,
          certificateIssued: moduleProgress.certificateIssued
        };
      }
      return course;
    });
  };

  return {
    ...state,
    loading: false,
    currentStudent: state.currentStudent && state.currentStudent._id === moduleStudentId
      ? { 
          ...state.currentStudent, 
          enrolledCourses: updateModuleCompletion(state.currentStudent.enrolledCourses || []) 
        }
      : state.currentStudent,
    userStudent: state.userStudent && state.userStudent._id === moduleStudentId
      ? { 
          ...state.userStudent, 
          enrolledCourses: updateModuleCompletion(state.userStudent.enrolledCourses || []) 
        }
      : state.userStudent,
    error: null
  };

case MARK_MODULE_COMPLETE_FAIL:
  return {
    ...state,
    loading: false,
    error: action.payload
  };

// Get Progress Details
case GET_PROGRESS_DETAILS_REQUEST:
  return {
    ...state,
    loading: true,
    error: null
  };

case GET_PROGRESS_DETAILS_SUCCESS:
  // Progress details are typically used temporarily, not stored in state
  return {
    ...state,
    loading: false,
    error: null
  };

case GET_PROGRESS_DETAILS_FAIL:
  return {
    ...state,
    loading: false,
    error: action.payload
  };

  case GET_STUDENT_STATS_REQUEST:
  return {
    ...state,
    loading: true,
    error: null
  };

case GET_STUDENT_STATS_SUCCESS:
  return {
    ...state,
    loading: false,
    studentStats: action.payload,
    error: null
  };

case GET_STUDENT_STATS_FAIL:
  return {
    ...state,
    loading: false,
    error: action.payload
  };

// Weekly activity actions
case GET_WEEKLY_ACTIVITY_REQUEST:
  return {
    ...state,
    loading: true,
    error: null
  };

case GET_WEEKLY_ACTIVITY_SUCCESS:
  return {
    ...state,
    loading: false,
    weeklyActivity: action.payload,
    error: null
  };

case GET_WEEKLY_ACTIVITY_FAIL:
  return {
    ...state,
    loading: false,
    error: action.payload
  };

    // Reset State
    case RESET_STUDENT_STATE:
      return initialState;

    default:
      return state;
  }
};

export default studentReducer;