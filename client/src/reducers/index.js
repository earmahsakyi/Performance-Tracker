import { combineReducers } from "redux";
import authReducer from "./authReducer";
import chatReducer from "./chatReducer";
import usersReducer from "./usersReducer";
import studentReducer from "./studentReducer";


const appReducer = combineReducers({
  auth: authReducer,
   chat: chatReducer,
   users: usersReducer,
   student: studentReducer
});

const rootReducer = (state, action) => {
  if (action.type === 'LOGOUT') {
    return appReducer(undefined, action); 
  }
  return appReducer(state, action);
};

export default rootReducer;
