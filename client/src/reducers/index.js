import { combineReducers } from "redux";
import authReducer from "./authReducer";
import chatReducer from "./chatReducer";
import usersReducer from "./usersReducer";
import studentReducer from "./studentReducer";
import courseReducer from "./courseReducer"; 
import { noteReducer } from "./noteReducer";
import forumReducer from "./forumReducer";
import adminForumReducer from "./adminForumReducer";
import studyGroupReducer from "./studyGroupReducer";


const appReducer = combineReducers({
  auth: authReducer,
   chat: chatReducer,
   users: usersReducer,
   student: studentReducer,
   course: courseReducer,
   note: noteReducer,
   forum: forumReducer,
   adminForum: adminForumReducer,
   studyGroup: studyGroupReducer
});

const rootReducer = (state, action) => {
  if (action.type === 'LOGOUT') {
    return appReducer(undefined, action); 
  }
  return appReducer(state, action);
};

export default rootReducer;
