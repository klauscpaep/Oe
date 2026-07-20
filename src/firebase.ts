import { initializeApp, getApp, getApps, deleteApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Default config provided by the user
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBjpZaRg2SW_NnFkKdQS7Li_FpuVdLnALQ",
  authDomain: "taner-940e0.firebaseapp.com",
  projectId: "taner-940e0",
  storageBucket: "taner-940e0.firebasestorage.app",
  messagingSenderId: "884167595596",
  appId: "1:884167595596:web:b4b61823680838d41f86e9",
  measurementId: "G-M09E9W2RX9"
};

// Initialize Firebase with let so we can update references on reinitialization
let app = getApps().length === 0 ? initializeApp(DEFAULT_FIREBASE_CONFIG) : getApp();
export let auth = getAuth(app);
export let db = getFirestore(app);
export let analytics: any = null;

// Helper to initialize analytics safely
function initAnalyticsSafely(appInstance: any) {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(appInstance);
      } catch (err) {
        console.warn("Failed to initialize Firebase Analytics:", err);
      }
    }
  }).catch((err) => {
    console.warn("Firebase Analytics is not supported in this environment:", err);
  });
}

// Initial safety initialization for analytics
initAnalyticsSafely(app);

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

  // Optimize: Check if the configuration is exactly the same as the current app's options to prevent redundant deletions
  try {
    const apps = getApps();
    if (apps.length > 0) {
      const currentOptions = apps[0].options;
      const isSame = 
        currentOptions.apiKey === config.apiKey &&
        currentOptions.authDomain === config.authDomain &&
        currentOptions.projectId === config.projectId &&
        currentOptions.storageBucket === config.storageBucket &&
        currentOptions.messagingSenderId === config.messagingSenderId &&
        currentOptions.appId === config.appId &&
        currentOptions.measurementId === config.measurementId;

      if (isSame) {
        // Configurations are identical. Do not recreate the app to avoid breaking active objects/listeners
        return;
      }
    }
  } catch (err) {
    console.warn("Failed to compare existing Firebase config, proceeding with check:", err);
  }

  try {
    const apps = getApps();
    if (apps.length > 0) {
      await Promise.all(apps.map(a => deleteApp(a).catch(() => {})));
    }
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    initAnalyticsSafely(app);
    console.log("Firebase dynamically reinitialized with settings:", config.projectId);
  } catch (error) {
    console.error("Failed to dynamically reinitialize Firebase with custom settings:", error);
  }
}

export default app;
