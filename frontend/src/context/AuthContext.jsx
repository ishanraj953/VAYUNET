import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vayunet_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('vayunet_token');
      const storedUser = localStorage.getItem('vayunet_user');
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('vayunet_user', JSON.stringify(res.data));
        } catch (e) {
          console.warn('Session expired or invalid:', e);
          localStorage.removeItem('vayunet_token');
          localStorage.removeItem('vayunet_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const res = await api.post('/auth/login', {
      email,
      password,
      remember_me: rememberMe
    });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('vayunet_token', access_token);
    localStorage.setItem('vayunet_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password
    });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('vayunet_token', access_token);
    localStorage.setItem('vayunet_user', JSON.stringify(userData));
    return userData;
  };

  const googleLogin = async (idToken) => {
    const res = await api.post('/auth/google', {
      id_token: idToken
    });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('vayunet_token', access_token);
    localStorage.setItem('vayunet_user', JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout endpoint notification:', e);
    } finally {
      localStorage.removeItem('vayunet_token');
      localStorage.removeItem('vayunet_user');
      setUser(null);
      setToken(null);
      window.location.href = '/login';
    }
  };

  const updateUserProfile = async (updates) => {
    const res = await api.put('/auth/profile', updates);
    setUser(res.data);
    localStorage.setItem('vayunet_user', JSON.stringify(res.data));
    return res.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user && !!token,
      loading,
      login,
      register,
      googleLogin,
      logout,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
