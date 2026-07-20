import { initializeApp, getApp, getApps, deleteApp } from "firebase/app";
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

// Initialize Firebase with let so we can update references on reinitialization
let app = getApps().length === 0 ? initializeApp(DEFAULT_FIREBASE_CONFIG) : getApp();
export let auth = getAuth(app);
export let db = getFirestore(app);

// Function to dynamically update/reinitialize Firebase config from settings
export async function updateFirebaseConfig(customSettings: any) {
  if (!customSettings) return;

  const config = {
    apiKey: customSettings.firebase_api_key || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: customSettings.firebase_auth_domain || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: customSettings.firebase_project_id || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: customSettings.firebase_storage_bucket || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: customSettings.firebase_messaging_sender_id || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: customSettings.firebase_app_id || DEFAULT_FIREBASE_CONFIG.appId,
    measurementId: customSettings.firebase_measurement_id || DEFAULT_FIREBASE_CONFIG.measurementId,
  };

  // If the apiKey is empty or matches our default and is not set, keep default
  if (!config.apiKey || config.apiKey === "") {
    return;
  }

  try {
    const apps = getApps();
    if (apps.length > 0) {
      await Promise.all(apps.map(a => deleteApp(a).catch(() => {})));
    }
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase dynamically reinitialized with settings:", config.projectId);
  } catch (error) {
    console.error("Failed to dynamically reinitialize Firebase with custom settings:", error);
  }
}

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
