import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  auth, 
  db, 
  googleProvider, 
  isConfigured as isFirebaseConfigured,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as fbSignOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  doc, 
  setDoc, 
  getDoc,
  formatFirebaseUser 
} from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vayunet_token'));
  const [loading, setLoading] = useState(true);
  const [firebaseActive, setFirebaseActive] = useState(false);

  useEffect(() => {
    let unsubscribeAuth = null;

    // Listen for real-time Firebase Auth state changes when Firebase is active
    if (auth) {
      try {
        unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
            setFirebaseActive(true);
            const formatted = formatFirebaseUser(fbUser);
            
            if (db) {
              try {
                const userDocRef = doc(db, 'users', fbUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                  Object.assign(formatted, userDocSnap.data());
                }
              } catch (e) {
                console.warn('Firestore user profile fetch notice:', e);
              }
            }

            const idToken = await fbUser.getIdToken();
            setUser(formatted);
            setToken(idToken);
            localStorage.setItem('vayunet_token', idToken);
            localStorage.setItem('vayunet_user', JSON.stringify(formatted));
            setLoading(false);
          } else {
            setFirebaseActive(false);
          }
        });
      } catch (e) {
        console.warn('Firebase onAuthStateChanged error:', e);
      }
    }

    // Initialize session from storage or backend API
    const initAuth = async () => {
      const storedToken = localStorage.getItem('vayunet_token');
      const storedUser = localStorage.getItem('vayunet_user');
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const res = await api.get('/auth/me');
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('vayunet_user', JSON.stringify(res.data));
          }
        } catch (e) {
          console.warn('Session verification notice:', e);
        }
      }
      setLoading(false);
    };

    initAuth();

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  // 1. Login (Firebase Auth with Backend Fallback)
  const login = async (email, password, rememberMe = false) => {
    let userData = null;
    let access_token = null;

    if (auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        access_token = await fbUser.getIdToken();
        userData = formatFirebaseUser(fbUser);
        setFirebaseActive(true);
      } catch (fbErr) {
        console.warn('Firebase sign-in attempt notice:', fbErr.message);
      }
    }

    if (!userData) {
      const res = await api.post('/auth/login', {
        email,
        password,
        remember_me: rememberMe
      });
      access_token = res.data.access_token;
      userData = res.data.user;
    }

    setToken(access_token);
    setUser(userData);
    localStorage.setItem('vayunet_token', access_token);
    localStorage.setItem('vayunet_user', JSON.stringify(userData));
    return userData;
  };

  // 2. Register (Firebase Auth + Firestore + Backend)
  const register = async (name, email, password) => {
    let userData = null;
    let access_token = null;

    if (auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        await updateProfile(fbUser, { displayName: name });
        access_token = await fbUser.getIdToken();
        userData = formatFirebaseUser(fbUser);

        if (db) {
          try {
            await setDoc(doc(db, 'users', fbUser.uid), {
              name,
              email,
              role: 'User',
              createdAt: new Date().toISOString()
            });
          } catch (fsErr) {
            console.warn('Firestore write notice:', fsErr);
          }
        }
        setFirebaseActive(true);
      } catch (fbErr) {
        console.warn('Firebase registration notice:', fbErr.message);
      }
    }

    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (!userData && res.data) {
        access_token = res.data.access_token;
        userData = res.data.user;
      }
    } catch (apiErr) {
      if (!userData) throw apiErr;
    }

    if (userData && access_token) {
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('vayunet_token', access_token);
      localStorage.setItem('vayunet_user', JSON.stringify(userData));
    }
    return userData;
  };

  // 3. Google Sign-In via Firebase Popup
  const googleLogin = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Firebase Authentication is not configured in .env.');
    }
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    const idToken = await fbUser.getIdToken();
    const userData = formatFirebaseUser(fbUser);

    if (db) {
      try {
        await setDoc(doc(db, 'users', fbUser.uid), {
          name: fbUser.displayName,
          email: fbUser.email,
          photoURL: fbUser.photoURL,
          provider: 'google.com',
          lastLogin: new Date().toISOString()
        }, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore Google user sync notice:', fsErr);
      }
    }

    setFirebaseActive(true);
    setToken(idToken);
    setUser(userData);
    localStorage.setItem('vayunet_token', idToken);
    localStorage.setItem('vayunet_user', JSON.stringify(userData));
    return userData;
  };

  // 4. Password Reset
  const resetPassword = async (email) => {
    if (auth) {
      return sendPasswordResetEmail(auth, email);
    }
    return api.post('/auth/forgot-password', { email });
  };

  // 5. Logout
  const logout = async () => {
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch (e) {
        console.warn('Firebase signout notice:', e);
      }
    }
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Backend logout notice:', e);
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
    if (auth?.currentUser) {
      try {
        if (updates.name) {
          await updateProfile(auth.currentUser, { displayName: updates.name });
        }
        if (db) {
          await setDoc(doc(db, 'users', auth.currentUser.uid), updates, { merge: true });
        }
      } catch (e) {
        console.warn('Firebase profile sync notice:', e);
      }
    }
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
      firebaseActive,
      isFirebaseConfigured,
      login,
      register,
      googleLogin,
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
