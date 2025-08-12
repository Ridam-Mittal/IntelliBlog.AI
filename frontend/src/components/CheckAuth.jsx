import React, { useLayoutEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
// import Footer from './Footer';

function CheckAuth({ children, protectedRoute, custom }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const verify = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/auth/verify', {
        withCredentials: true,
      });

      // Save to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('expiry', Date.now() + 86400000); // 24 hrs in ms

      // Set state
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      console.error('Verification failed: ', err.response?.data || err.message);
    }
  };

  useLayoutEffect(() => {
    const checkAuth = async () => {
      let storedToken = localStorage.getItem('token');
      let storedUser = localStorage.getItem('user');
      const expiry = localStorage.getItem('expiry');
      console.log('running');
      // Clear data if expired
      if (expiry === 'undefined' || !expiry || (expiry && Date.now() > parseInt(expiry))) {
        console.log('expiry removal');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('expiry');
        storedToken = null;
        storedUser = null;
      }

      console.log(expiry);

      // Try verifying via cookie if token isn't in localStorage
      if (!storedToken && protectedRoute) {
        console.log('renew');
        await verify();
        storedToken = localStorage.getItem('token');
        storedUser = localStorage.getItem('user');
      }

      if (protectedRoute && !storedToken) {
        navigate('/login', { replace: true });
      } else if (!protectedRoute && storedToken && (location.pathname === '/register' || location.pathname === '/login')){
        navigate('/', { replace: true });
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setChecking(false);
      }
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
    checkAuth();
  }, [navigate, protectedRoute, location.pathname]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-200 text-white">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }


  if(custom){
    return (
      children
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 font-sans">
      <Navbar user={user} />
        {children}
      <Footer/>
    </div>
  );
}

export default CheckAuth;

