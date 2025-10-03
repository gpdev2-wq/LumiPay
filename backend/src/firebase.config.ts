import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Use the same Firebase config as your frontend
const firebaseConfig = {
  apiKey: "AIzaSyA7fU0o-OA2Oy9tPrWNcYa1qsa4i7YwANk",
  authDomain: "dttoinr.firebaseapp.com",
  projectId: "dttoinr",
  storageBucket: "dttoinr.firebasestorage.app",
  messagingSenderId: "797035412107",
  appId: "1:797035412107:web:ae3177f51b163ca41f328e",
  measurementId: "G-601RENMBL2"
};

let app;
let db: Firestore | null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  db = null;
}

export { db };

// Mock auth for now (we'll use Firestore directly)
export const auth = null;
