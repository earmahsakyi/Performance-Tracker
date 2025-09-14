// Solution 1: Modified noteReducer with localStorage persistence
import {
  ADD_NOTE_REQUEST,
  ADD_NOTE_SUCCESS,
  ADD_NOTE_FAIL,
  UPDATE_NOTE_REQUEST,
  UPDATE_NOTE_SUCCESS,
  UPDATE_NOTE_FAIL,
  DELETE_NOTE_REQUEST,
  DELETE_NOTE_SUCCESS,
  DELETE_NOTE_FAIL,
  GET_NOTES_REQUEST,
  GET_NOTES_SUCCESS,
  GET_NOTES_FAIL,
  GET_NOTE_REQUEST,
  GET_NOTE_SUCCESS,
  GET_NOTE_FAIL,
} from "../actions/types.js";

// Helper functions for localStorage
const loadNotesFromStorage = () => {
  try {
    const serializedNotes = localStorage.getItem('studentNotes');
    return serializedNotes ? JSON.parse(serializedNotes) : [];
  } catch (error) {
    console.error('Error loading notes from localStorage:', error);
    return [];
  }
};

const saveNotesToStorage = (notes) => {
  try {
    localStorage.setItem('studentNotes', JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes to localStorage:', error);
  }
};

// Modified initial state to load from localStorage
const initialState = {
  loading: false,
  notes: loadNotesFromStorage(), // Load from localStorage on app start
  note: null,
  error: null,
};

export const noteReducer = (state = initialState, action) => {
  let newState;
  
  switch (action.type) {
    case ADD_NOTE_REQUEST:
    case UPDATE_NOTE_REQUEST:
    case DELETE_NOTE_REQUEST:
    case GET_NOTES_REQUEST:
    case GET_NOTE_REQUEST:
      return { ...state, loading: true };

    case ADD_NOTE_SUCCESS:
      newState = { 
        ...state, 
        loading: false, 
        notes: [...state.notes, action.payload] 
      };
      saveNotesToStorage(newState.notes); // Save to localStorage
      return newState;

    case UPDATE_NOTE_SUCCESS:
      newState = {
        ...state,
        loading: false,
        notes: state.notes.map((note) =>
          note._id === action.payload._id ? action.payload : note
        ),
      };
      saveNotesToStorage(newState.notes); 
      return newState;

    case DELETE_NOTE_SUCCESS:
      newState = {
        ...state,
        loading: false,
        notes: state.notes.filter((note) => note._id !== action.payload),
      };
      saveNotesToStorage(newState.notes); 
      return newState;

    case GET_NOTES_SUCCESS:
      newState = { ...state, loading: false, notes: action.payload };
      saveNotesToStorage(newState.notes); 
      return newState;

    case GET_NOTE_SUCCESS:
      return { ...state, loading: false, note: action.payload };

    case ADD_NOTE_FAIL:
    case UPDATE_NOTE_FAIL:
    case DELETE_NOTE_FAIL:
    case GET_NOTES_FAIL:
    case GET_NOTE_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
