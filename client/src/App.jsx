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
// import ChatDashboard from './components/pages/ChatDashboard';
import PrivateRoute from './components/routing/PrivateRoute';
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
