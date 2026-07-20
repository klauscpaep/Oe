import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Default config provided by the user
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBvYe30DDUv7UQyiqqvSyf3grrFtAypOcc",
  authDomain: "test-b2c10.firebaseapp.com",
  projectId: "test-b2c10",
  storageBucket: "test-b2c10.firebasestorage.app",
  messagingSenderId: "327490613808",
  appId: "1:327490613808:web:7df47f3ac51de38c17f3f5",
  measurementId: "G-6MNLW7ME6G"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(DEFAULT_FIREBASE_CONFIG) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics conditionally
export let analytics: any = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch((err) => {
  console.warn("Firebase Analytics is not supported in this environment:", err);
});

export default app;
