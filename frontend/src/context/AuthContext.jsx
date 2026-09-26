import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vayunet_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('vayunet_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify stored session with FastAPI backend & MongoDB Atlas
    const verifySession = async () => {
      const storedToken = localStorage.getItem('vayunet_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('vayunet_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Backend session verification note:', err?.response?.data?.detail || err.message);
          // If token expired or invalid, keep existing local state or refresh
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  // 1. Direct FastAPI + MongoDB Login
  const login = async (email, password, rememberMe = false) => {
    const res = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
      remember_me: rememberMe
    });

    const access_token = res.data.access_token;
    const userData = res.data.user;

    setToken(access_token);
    setUser(userData);
    localStorage.setItem('vayunet_token', access_token);
    localStorage.setItem('vayunet_user', JSON.stringify(userData));
    return userData;
  };

  // 2. Direct FastAPI + MongoDB Registration
  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    });

    const access_token = res.data.access_token;
    const userData = res.data.user;

    setToken(access_token);
    setUser(userData);
    localStorage.setItem('vayunet_token', access_token);
    localStorage.setItem('vayunet_user', JSON.stringify(userData));
    return userData;
  };

  // 3. Quick Demo Authentication (Analyst, Admin, Guest)
  const demoLogin = async (role = 'analyst') => {
    const credentials = {
      admin: { email: 'admin@vayunet.in', password: 'admin' },
      analyst: { email: 'analyst@vayunet.in', password: 'analyst' },
      user: { email: 'demo@vayunet.in', password: 'demo' }
    };
    const target = credentials[role] || credentials.analyst;
    return login(target.email, target.password);
  };

  // 4. Password Reset
  const resetPassword = async (email) => {
    return api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
  };

  // 5. Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('vayunet_token');
      localStorage.removeItem('vayunet_user');
      setUser(null);
      setToken(null);
      window.location.href = '/login';
    }
  };

  // 6. Profile Update
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
      isAuthenticated: Boolean(user && token),
      loading,
      login,
      register,
      demoLogin,
      resetPassword,
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
