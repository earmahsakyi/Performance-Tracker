import { 
    AUTH_ERROR, REGISTER_FAIL, REGISTER_SUCCESS, LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT, USER_LOADED, AUTH_SET_LOADING, // Changed SET_LOADING to AUTH_SET_LOADING
    EMAIL_VERIFICATION_REQUEST_SENT, EMAIL_VERIFICATION_REQUEST_FAILED,
    EMAIL_VERIFICATION_CONFIRMED, EMAIL_VERIFICATION_CONFIRM_FAILED,
     FORGOT_PASSWORD_SUCCESS, FORGOT_PASSWORD_FAIL,
     RESET_PASSWORD_SUCCESS, RESET_PASSWORD_FAIL,
     ADD_USER_SUCCESS,ADD_USER_FAIL,
    CLEAR_AUTH_MESSAGE,GET_ALL_USERS_SUCCESS,GET_ALL_USERS_FAIL,
    GET_USER_BY_ID_SUCCESS,GET_USER_BY_ID_FAIL,
    DELETE_USER_SUCCESS,DELETE_USER_FAIL,
    EDIT_USER_SUCCESS,EDIT_USER_FAIL,
    UNBLOCK_USER,UNBLOCK_USER_FAIL
} from '../actions/types';

const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
    message: '',
    email: '',
    emailVerificationStatus: null,
    passwordResetStatus: null,
    users:[],

};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    // Loading state
    case AUTH_SET_LOADING: 
      return { ...state, loading: true, error: null };

    
    case LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token)
      return {
      ...state,
        isAuthenticated: true,
     loading: false,
      error: null,
      token: action.payload.token, // Store token in state
       user: {
          id: action.payload.userId,
          role: action.payload.role,
          profileUpdated: action.payload.profileUpdated,
        }
   };
   case UNBLOCK_USER:
    return {
      ...state,
      loading: false,
      message: action.payload.message || action.payload,
      error: null,
    };

    case UNBLOCK_USER_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

   case EDIT_USER_SUCCESS:
    return {
      ...state,
      loading: false,
      users: state.users.map(user =>
      user._id === action.payload.data?._id
        ? { ...user, ...action.payload.data }
        : user
    ),
      message: action.payload.message || action.payload,
      error: null,
    };

  case DELETE_USER_SUCCESS:
    return {
      ...state,
      loading:false,
      message:action.payload.message || action.payload,
      users: state.users.filter(user => user._id !== action.payload.userId),
      error:null
    }
  case DELETE_USER_FAIL:
  case EDIT_USER_FAIL:
    return {
      ...state,
      loading: false,
      error: action.payload,
    };


   case  ADD_USER_SUCCESS:
    return {
      ...state,
      loading: false,
      message: action.payload.message || action.payload,
      error: null,
    };

    case GET_ALL_USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        users: action.payload || [],
        error: null,
      };
    
    case GET_USER_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload,
        error: null,
      };
    
    case GET_ALL_USERS_FAIL:
    case GET_USER_BY_ID_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case ADD_USER_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    
    case REGISTER_SUCCESS:
  return {
    ...state,
    isAuthenticated: false, 
    loading: false, 
    message: 'Check your email to verify your account.',
    email: action.payload.email || localStorage.getItem('email') || '',
  };

    case USER_LOADED:
        return {
                  ...state,
             isAuthenticated: true,
              loading: false,
            error: null,
             user: {
              ...state.user,
            ...action.payload, 
      id: action.payload._id || action.payload.userId 
    }
  };

    

    // Email verification
    case EMAIL_VERIFICATION_REQUEST_SENT:
      return {
        ...state,
        loading: false,
        email: action.payload.email,
        emailVerificationStatus: 'sent',
      };

    case EMAIL_VERIFICATION_CONFIRMED:
      return {
        ...state,
        isAuthenticated: true, 
        emailVerificationStatus: 'confirmed',
        loading : false,
        message: action.payload.message,
        
      };

    // Error handling
    case REGISTER_FAIL:
    case LOGIN_FAIL:
    case AUTH_ERROR:
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload,
      };
      case RESET_PASSWORD_SUCCESS:
        return{
          ...state,
        loading: false,
        passwordResetStatus: 'success',
        message: action.payload.message || action.payload,
        email: null
        }
    // Password reset
    case FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        passwordResetStatus: 'success',
        message: action.payload.message || action.payload,
        email: action.payload.email || '',
      };
    case RESET_PASSWORD_FAIL:
    case FORGOT_PASSWORD_FAIL:
      return{
          ...state,
          loading: false,
          error: action.payload

      }
    case EMAIL_VERIFICATION_REQUEST_FAILED:
    case EMAIL_VERIFICATION_CONFIRM_FAILED:
         return {
             ...state,
             loading: false, 
             error: action.payload,
  };

    case CLEAR_AUTH_MESSAGE:
      return {
        
        ...state,
        message: null, 
        loading:false
      };

    default:
      return state;
  }
};

export default authReducer;