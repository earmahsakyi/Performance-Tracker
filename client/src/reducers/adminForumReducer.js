import * as types from '../actions/types';

const initialState = {
  loading: false,
  error: null,
  categories: [],
  analytics: null,
  posts: []
};

const adminForumReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.ADMIN_FORUM_LOADING:
      return {
        ...state,
        loading: true,
        error: null
      };

    case types.ADMIN_FORUM_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case types.ADMIN_FORUM_CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case types.GET_CATEGORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: action.payload
      };

    case types.CREATE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: [...state.categories, action.payload]
      };

    case types.UPDATE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: state.categories.map(category =>
          category._id === action.payload._id ? action.payload : category
        )
      };

    case types.DELETE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: state.categories.filter(
          category => category._id !== action.payload
        )
      };

    case types.TOGGLE_PIN_POST_SUCCESS:
    case types.TOGGLE_LOCK_POST_SUCCESS:
      // You might want to update specific post in state if you're storing posts
      return {
        ...state,
        loading: false
      };

    case types.DELETE_POST_SUCCESS:
      // Remove post from state if stored
      return {
        ...state,
        loading: false
      };

    case types.GET_ANALYTICS_SUCCESS:
      return {
        ...state,
        loading: false,
        analytics: action.payload
      };

    default:
      return state;
  }
};

export default adminForumReducer;