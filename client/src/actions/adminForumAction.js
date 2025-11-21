import * as types from './types';
import axios from 'axios';

const setAuthToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    // Try both possible header formats
    axios.defaults.headers.common['x-auth-token'] = token;
   
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};


// Error handling
export const clearError = () => ({
  type: types.ADMIN_FORUM_CLEAR_ERROR
});

// Categories
export const getCategories = () => async (dispatch) => {
  try {
    setAuthToken();
    dispatch({ type: types.ADMIN_FORUM_LOADING });
    const res = await axios.get('/api/admin/forum/categories');
    dispatch({
      type: types.GET_CATEGORIES_SUCCESS,
      payload: res.data.data
    });
  } catch (err) {
    dispatch({
      type: types.ADMIN_FORUM_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch categories'
    });
  }
};

export const createCategory = (formData) => async (dispatch) => {
  try {
    setAuthToken();
    dispatch({ type: types.ADMIN_FORUM_LOADING });
    const res = await axios.post('/api/admin/forum/categories', formData);
    dispatch({
      type: types.CREATE_CATEGORY_SUCCESS,
      payload: res.data.data
    });
    return { success: true };
  } catch (err) {
    const error = err.response?.data?.errors[0].message || 'Failed to create category';
    dispatch({
      type: types.ADMIN_FORUM_ERROR,
      payload: error
    });
    return { success: false, error };
  }
};

export const updateCategory = (categoryId, formData) => async (dispatch) => {
  try {
    setAuthToken();
    dispatch({ type: types.ADMIN_FORUM_LOADING });
    const res = await axios.put(`/api/admin/forum/categories/${categoryId}`, formData);
    dispatch({
      type: types.UPDATE_CATEGORY_SUCCESS,
      payload: res.data.data
    });
    return { success: true };
  } catch (err) {
    const error = err.response?.data?.message || 'Failed to update category';
    dispatch({
      type: types.ADMIN_FORUM_ERROR,
      payload: error
    });
    return { success: false, error };
  }
};

export const deleteCategory = (categoryId) => async (dispatch) => {
  try {
    setAuthToken();
    dispatch({ type: types.ADMIN_FORUM_LOADING });
    await axios.delete(`/api/admin/forum/categories/${categoryId}`);
    dispatch({
      type: types.DELETE_CATEGORY_SUCCESS,
      payload: categoryId
    });
    return { success: true };
  } catch (err) {
    const error = err.response?.data?.message || 'Failed to delete category';
    dispatch({
      type: types.ADMIN_FORUM_ERROR,
      payload: error
    });
    return { success: false, error };
  }
};

// Post Moderation
export const togglePinPost = (postId) => async (dispatch) => {
  try {
    setAuthToken();
    dispatch({ type: types.ADMIN_FORUM_LOADING });
    const res = await axios.put(`/api/admin/forum/posts/${postId}/pin`);
    dispatch({
      type: types.TOGGLE_PIN_POST_SUCCESS,
      payload: res.data.data
    });
    return { success: true };
  } catch (err) {
    const error = err.response?.data?.message || 'Failed to toggle pin status';
    dispatch({
      type: types.ADMIN_FORUM_ERROR,
      payload: error
    });
    return { success: false, error };
  }
};

export const toggleLockPost = (postId) => async (dispatch) => {
  try {
    setAuthToken();
    dispatch({ type: types.ADMIN_FORUM_LOADING });
    const res = await axios.put(`/api/admin/forum/posts/${postId}/lock`);
    dispatch({
      type: types.TOGGLE_LOCK_POST_SUCCESS,
      payload: res.data.data
    });
    return { success: true };
  } catch (err) {
    const error = err.response?.data?.message || 'Failed to toggle lock status';
    dispatch({
      type: types.ADMIN_FORUM_ERROR,
      payload: error
    });
    return { success: false, error };
  }
};

export const deletePost = (postId) => async (dispatch) => {
  try {
    setAuthToken();
    dispatch({ type: types.ADMIN_FORUM_LOADING });
    await axios.delete(`/api/admin/forum/posts/${postId}`);
    dispatch({
      type: types.DELETE_POST_SUCCESS,
      payload: postId
    });
    return { success: true };
  } catch (err) {
    const error = err.response?.data?.message || 'Failed to delete post';
    dispatch({
      type: types.ADMIN_FORUM_ERROR,
      payload: error
    });
    return { success: false, error };
  }
};

// Analytics
export const getForumAnalytics = (period = '30d') => async (dispatch) => {
  try {
    setAuthToken();
    dispatch({ type: types.ADMIN_FORUM_LOADING });
    const res = await axios.get(`/api/admin/forum/analytics?period=${period}`);
    dispatch({
      type: types.GET_ANALYTICS_SUCCESS,
      payload: res.data.data
    });
  } catch (err) {
    dispatch({
      type: types.ADMIN_FORUM_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch analytics'
    });
  }
};