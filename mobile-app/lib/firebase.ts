// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getReactNativePersistence,
  initializeAuth,
  getAuth,
  Auth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC9uswL54sAbDiAo5vFe2h7uPbxlBfKYyQ",
  authDomain: "back2birth-f1773.firebaseapp.com",
  projectId: "back2birth-f1773",
  storageBucket: "back2birth-f1773.appspot.com", 
  messagingSenderId: "603142523333",
  appId: "1:603142523333:web:880c6f0bee54abb3e563ac",
  measurementId: "G-133WECG4TY",
};

// Initialize app once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Always call initializeAuth first in React Native
let _auth: Auth;

try {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e: any) {
  // If initializeAuth fails (e.g., hot reload), rethrow
  throw e;
}

export const auth = _auth;
