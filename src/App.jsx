import React, { useContext, useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Login from './pages/login/login'
import Chat from './pages/chat/chat'
import ProfileUpdate from './pages/profileupdate/profileupdate'
import { ToastContainer } from 'react-toastify'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase'
import { AppContext } from './context/AppContext'

const App = () => {
  const navigate = useNavigate();
  const { loadUserData, userdata } = useContext(AppContext);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/');
        return;
      }
      await loadUserData(user.uid);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userdata) return;

    if (userdata.avatar && userdata.name) {
      navigate('/chat');
    } else {
      navigate('/updateprofile');
    }
  }, [userdata]);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/updateprofile' element={<ProfileUpdate />} />
      </Routes>
    </>
  )
}

export default App