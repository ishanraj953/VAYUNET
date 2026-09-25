import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';

// Pure environment-driven Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app = null;
let auth = null;
let db = null;
let googleProvider = null;
let isConfigured = false;

// Initialize Firebase only when valid environment configuration is present
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    isConfigured = true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    isConfigured = false;
  }
}

export { 
  app, 
  auth, 
  db, 
  googleProvider,
  isConfigured,
  firebaseConfig,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
};

export const isFirebaseLive = () => isConfigured;

export const formatFirebaseUser = (fbUser) => {
  if (!fbUser) return null;
  return {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || "User",
    email: fbUser.email,
    role: "User",
    avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${fbUser.email || 'User'}`,
    provider: fbUser.providerData?.[0]?.providerId || "firebase"
  };
};

export default app;
