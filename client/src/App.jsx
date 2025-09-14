import React, { useEffect } from 'react';
import {Toaster} from "react-hot-toast"
import {  Routes, Route } from 'react-router-dom';
import Store from './store';
import { Provider, useDispatch } from 'react-redux';
import LandingPage from './components/pages/LandingPage';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import VerifyEmail from './components/auth/VerifyEmail';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Courses from './components/dashboard/student/Courses';
import CourseLearning from './components/dashboard/student/CourseLearning';
import Notes from './components/dashboard/student/Notes';
import Progress from './components/dashboard/student/Progress';
import Forum from './components/dashboard/student/Forum';
import Groups from './components/dashboard/student/Group';
import PostView from './components/dashboard/student/PostView';
import CategoryPosts from './components/dashboard/student/CategoryPost'; 
// import ChatDashboard from './components/pages/ChatDashboard';
import PrivateRoute from './components/routing/PrivateRoute';
import DashboardOverview from './components/dashboard/student/DashboardOverview';
import CompleteProfileForm from './components/student/CompleteProfileForm';
import { loadUser } from './actions/authAction'; 

const AppInner = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
       <Route path="/signup" element={<Register/>} />
       <Route path="/login" element={<Login/>} />
       <Route path="/verify-email" element={<VerifyEmail/>} />
       <Route path="/forgot-password" element={<ForgotPassword/>} />
       <Route path="/reset-password" element={<ResetPassword/>} />
      <Route path="/complete-student-profile" element={<PrivateRoute element={CompleteProfileForm}/>} /> 
      <Route path="/student-dashboard" element={<PrivateRoute element={DashboardOverview}/>} /> 
      <Route path="/courses" element={<PrivateRoute element={Courses}/>} /> 
      <Route path="/student/courses/:courseId/learn" element={<PrivateRoute element={CourseLearning}/>} /> 
      <Route path="/student/notes" element={<PrivateRoute element={Notes}/>} /> 
      <Route path="/student/progress" element={<PrivateRoute element={Progress}/>} /> 
      <Route path="/student/forum" element={<PrivateRoute element={Forum}/>} /> 
      <Route path="/student/groups" element={<PrivateRoute element={Groups}/>} /> 
      <Route path="/forum/post/:postId" element={<PrivateRoute element={PostView}/>} /> 
      <Route path="/forum/category/:categoryId" element={<PrivateRoute element={CategoryPosts}/>} /> 
   
    </Routes>
  );
};

const App = () => {
  return (

    <Provider store={Store}>

   
        <AppInner />
    <Toaster position="top-right"
    toastOptions={{
    duration: 5000,
    style: {
      background: '#363636',
      color: '#fff',
    },
    success: {
      style: {
        background: '#4caf50',
      },
    },
    error: {
      style: {
        background: '#ef5350',
      },
    },
  }}

    /> 
  
    </Provider>
  );
};

export default App;
