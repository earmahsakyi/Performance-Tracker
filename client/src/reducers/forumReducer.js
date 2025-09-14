import { FORUM_TYPES } from '../actions/types';

const initialState = {
  // Dashboard data
  forumStats: [],
  forumCategories: [],
  trendingTopics: [],
  
  // Categories
  categories: [],
  activeCategory: null,
  
  // Posts
  posts: [],
  currentPost: null,
  currentComments: [],
  postsLoading: false,
  postLoading: false,
  
  // Search
  searchResults: [],
  searchQuery: '',
  searchLoading: false,
  
  // UI State
  loading: false,
  error: null,
  
  // Pagination
  pagination: {
    current: 1,
    pages: 1,
    total: 0
  }
};

const forumReducer = (state = initialState, action) => {
  switch (action.type) {
    // Dashboard cases
    case FORUM_TYPES.GET_FORUM_DASHBOARD_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case FORUM_TYPES.GET_FORUM_DASHBOARD_SUCCESS:
      return {
        ...state,
        loading: false,
        forumStats: action.payload.forumStats,
        forumCategories: action.payload.forumCategories,
        trendingTopics: action.payload.trendingTopics,
        error: null
      };
    
    case FORUM_TYPES.GET_FORUM_DASHBOARD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // Categories cases
    case FORUM_TYPES.GET_CATEGORIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case FORUM_TYPES.GET_CATEGORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: action.payload,
        error: null
      };
    
    case FORUM_TYPES.GET_CATEGORIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // Posts cases
    case FORUM_TYPES.GET_POSTS_REQUEST:
      return {
        ...state,
        postsLoading: true,
        error: null
      };
    
    case FORUM_TYPES.GET_POSTS_SUCCESS:
      return {
        ...state,
        postsLoading: false,
        posts: action.payload.posts,
        pagination: action.payload.pagination,
        error: null
      };
    
    case FORUM_TYPES.GET_POSTS_FAILURE:
      return {
        ...state,
        postsLoading: false,
        error: action.payload
      };

    case FORUM_TYPES.GET_POST_REQUEST:
      return {
        ...state,
        postLoading: true,
        error: null
      };
    
    case FORUM_TYPES.GET_POST_SUCCESS:
      return {
        ...state,
        postLoading: false,
        currentPost: action.payload.post,
        currentComments: action.payload.comments,
        error: null
      };
    
    case FORUM_TYPES.GET_POST_FAILURE:
      return {
        ...state,
        postLoading: false,
        error: action.payload
      };

    case FORUM_TYPES.CREATE_POST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case FORUM_TYPES.CREATE_POST_SUCCESS:
      return {
        ...state,
        loading: false,
        posts: [action.payload, ...state.posts],
        error: null
      };
    
    case FORUM_TYPES.CREATE_POST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case FORUM_TYPES.TOGGLE_POST_LIKE_SUCCESS:
      return {
        ...state,
        posts: state.posts.map(post =>
          post._id === action.payload.postId
            ? { ...post, likesCount: action.payload.likesCount }
            : post
        ),
        currentPost: state.currentPost && state.currentPost._id === action.payload.postId
          ? { ...state.currentPost, likesCount: action.payload.likesCount }
          : state.currentPost,
        trendingTopics: state.trendingTopics.map(topic =>
          topic._id === action.payload.postId
            ? { ...topic, likes: action.payload.likesCount }
            : topic
        )
      };

    // Comment cases
    case FORUM_TYPES.ADD_COMMENT_SUCCESS:
      return {
        ...state,
        currentComments: [...state.currentComments, action.payload],
        currentPost: state.currentPost
          ? { ...state.currentPost, repliesCount: (state.currentPost.repliesCount || 0) + 1 }
          : state.currentPost
      };

    // Search cases
    case FORUM_TYPES.SEARCH_POSTS_REQUEST:
      return {
        ...state,
        searchLoading: true,
        error: null
      };
    
    case FORUM_TYPES.SEARCH_POSTS_SUCCESS:
      return {
        ...state,
        searchLoading: false,
        searchResults: action.payload.posts,
        pagination: action.payload.pagination,
        error: null
      };
    
    case FORUM_TYPES.SEARCH_POSTS_FAILURE:
      return {
        ...state,
        searchLoading: false,
        error: action.payload
      };

    // UI cases
    case FORUM_TYPES.SET_ACTIVE_CATEGORY:
      return {
        ...state,
        activeCategory: action.payload
      };

    case FORUM_TYPES.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload
      };

    case FORUM_TYPES.CLEAR_CURRENT_POST:
      return {
        ...state,
        currentPost: null,
        currentComments: []
      };

    case FORUM_TYPES.CLEAR_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: [],
        searchQuery: ''
      };

    case FORUM_TYPES.CLEAR_FORUM_ERRORS:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

export default forumReducer;