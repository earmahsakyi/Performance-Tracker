import axios from 'axios';
import { FORUM_TYPES } from './types';
import { toast } from 'react-hot-toast';

const API_URL = '/api';

const setAuthToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

// Dashboard Actions
export const getForumDashboard = () => async (dispatch) => {
  try {
    setAuthToken();
    dispatch({ type: FORUM_TYPES.GET_FORUM_DASHBOARD_REQUEST });

    const response = await axios.get(`${API_URL}/forum/dashboard`);

    dispatch({
      type: FORUM_TYPES.GET_FORUM_DASHBOARD_SUCCESS,
      payload: response.data.data
    });

  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch forum dashboard';
    
    dispatch({
      type: FORUM_TYPES.GET_FORUM_DASHBOARD_FAILURE,
      payload: message
    });

    toast.error(message);
  }
};

// Category Actions
export const getCategories = () => async (dispatch) => {
  try {
    setAuthToken();
    dispatch({ type: FORUM_TYPES.GET_CATEGORIES_REQUEST });

    const response = await axios.get(`${API_URL}/forum/categories`);

    dispatch({
      type: FORUM_TYPES.GET_CATEGORIES_SUCCESS,
      payload: response.data.data
    });

  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch categories';
    
    dispatch({
      type: FORUM_TYPES.GET_CATEGORIES_FAILURE,
      payload: message
    });
    
    // Don't show toast for category errors - they're not critical
    console.error('Failed to fetch categories:', message);
  }
};

// Posts Actions
export const getPostsByCategory = (categoryId, options = {}) => async (dispatch) => {
  try {
    setAuthToken();
    
    dispatch({ type: FORUM_TYPES.GET_POSTS_REQUEST });

    const { page = 1, limit = 10, sort = 'recent' } = options;

    const response = await axios.get(
      `${API_URL}/forum/categories/${categoryId}/posts?page=${page}&limit=${limit}&sort=${sort}`
    );

    dispatch({
      type: FORUM_TYPES.GET_POSTS_SUCCESS,
      payload: response.data.data
    });

  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch posts';
    
    dispatch({
      type: FORUM_TYPES.GET_POSTS_FAILURE,
      payload: message
    });

    toast.error(message);
  }
};

export const getPost = (postId) => async (dispatch) => {
  try {
    setAuthToken();
    dispatch({ type: FORUM_TYPES.GET_POST_REQUEST });

    const response = await axios.get(`${API_URL}/forum/posts/${postId}`);

    dispatch({
      type: FORUM_TYPES.GET_POST_SUCCESS,
      payload: response.data.data
    });

  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch post';
    
    dispatch({
      type: FORUM_TYPES.GET_POST_FAILURE,
      payload: message
    });

    toast.error(message);
  }
};

export const createPost = (postData) => async (dispatch) => {
  try {
    setAuthToken();
    dispatch({ type: FORUM_TYPES.CREATE_POST_REQUEST });
    console.log(postData)
    const response = await axios.post(`${API_URL}/forum/posts`, postData);

    dispatch({
      type: FORUM_TYPES.CREATE_POST_SUCCESS,
      payload: response.data.data
    });

   
    return response.data.data;

  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create post';
    
    dispatch({
      type: FORUM_TYPES.CREATE_POST_FAILURE,
      payload: message
    });

    toast.error(message);
    throw error;
  }
};

export const togglePostLike = (postId) => async (dispatch) => {
  try {
    setAuthToken();
    dispatch({ type: FORUM_TYPES.TOGGLE_POST_LIKE_REQUEST });

    const response = await axios.post(`${API_URL}/forum/posts/${postId}/like`, {});

    dispatch({
      type: FORUM_TYPES.TOGGLE_POST_LIKE_SUCCESS,
      payload: {
        postId,
        ...response.data.data
      }
    });

  } catch (error) {
    const message = error.response?.data?.message || 'Failed to toggle like';
    
    dispatch({
      type: FORUM_TYPES.TOGGLE_POST_LIKE_FAILURE,
      payload: message
    });

    toast.error(message);
  }
};

// Comment Actions
export const addComment = (postId, commentData) => async (dispatch) => {
  try {
    setAuthToken();
    dispatch({ type: FORUM_TYPES.ADD_COMMENT_REQUEST });

    const response = await axios.post(
      `${API_URL}/forum/posts/${postId}/comments`,
      commentData
    );

    dispatch({
      type: FORUM_TYPES.ADD_COMMENT_SUCCESS,
      payload: response.data.data
    });

    
    return response.data.data;

  } catch (error) {
    const message = error.response?.data?.message || 'Failed to add comment';
    
    dispatch({
      type: FORUM_TYPES.ADD_COMMENT_FAILURE,
      payload: message
    });

    toast.error(message);
    throw error;
  }
};

// Search Actions
export const searchPosts = (query, options = {}) => async (dispatch) => {
  try {
    setAuthToken();
    dispatch({ type: FORUM_TYPES.SEARCH_POSTS_REQUEST });

    const { category = 'all', sort = 'relevance', page = 1, limit = 10 } = options;

    const params = new URLSearchParams({
      q: query,
      category,
      sort,
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await axios.get(`${API_URL}/forum/search?${params}`);

    dispatch({
      type: FORUM_TYPES.SEARCH_POSTS_SUCCESS,
      payload: response.data.data
    });

  } catch (error) {
    const message = error.response?.data?.message || 'Failed to search posts';
    
    dispatch({
      type: FORUM_TYPES.SEARCH_POSTS_FAILURE,
      payload: message
    });

    toast.error(message);
  }
};

// UI Actions
export const setActiveCategory = (categoryId) => ({
  type: FORUM_TYPES.SET_ACTIVE_CATEGORY,
  payload: categoryId
});

export const setSearchQuery = (query) => ({
  type: FORUM_TYPES.SET_SEARCH_QUERY,
  payload: query
});

export const clearCurrentPost = () => ({
  type: FORUM_TYPES.CLEAR_CURRENT_POST
});

export const clearSearchResults = () => ({
  type: FORUM_TYPES.CLEAR_SEARCH_RESULTS
});

export const clearForumErrors = () => ({
  type: FORUM_TYPES.CLEAR_FORUM_ERRORS
});