import React, { useEffect } from 'react'
import {Routes , Route, Navigate} from "react-router-dom"
import Navbar from './components/Navbar.jsx'
import { useAuthStore } from './store/authStore.js';
import { useThemeStore } from './store/themeStore.js';
import { Home, Loader } from 'lucide-react';
import Signup from './components/pages/Signup.jsx';
import { Toaster } from 'react-hot-toast';
import Login from './components/pages/Login.jsx';
import Profile from './components/pages/Profile.jsx';
import SettingsPage from './components/pages/SettingsPage.jsx';
import HomePage from './components/pages/HomePage.jsx';



function App() {

  const {authUser , checkAuth ,isCheckingAuth , onlineUsers} = useAuthStore();
  const {theme} = useThemeStore();
  useEffect(() => {
    checkAuth();
  },[checkAuth]);

  if(isCheckingAuth && !authUser){
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className = "size-20 text-blue-500 animate-spin"/>
      </div>
    )
  }

  return (
    <div data-theme={theme} className="min-h-screen flex flex-col ">
      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <HomePage/> : <Navigate to="/login"/>} />
        <Route path="/signup" element={!authUser ? <Signup/> : <Navigate to="/login"/>} />
        <Route path="/login" element={!authUser ? <Login/> : <Navigate to="/"/>} />
        <Route path="/settings" element={<SettingsPage/>} />
        <Route path="/profile" element={ authUser ? <Profile/> : <Navigate to="/login"/>} />
      </Routes>


      <Toaster />
    </div>
  )
}

export default App
