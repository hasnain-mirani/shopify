import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId,
  );
}

let app: FirebaseApp | undefined;

function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app =
      getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;
  }
  return app;
}

let authSingleton: Auth | null | undefined;

/**
 * Returns Firebase Auth when env is configured, otherwise null.
 * Avoids initializeApp during import so builds/prerender succeed without keys.
 */
export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null;
  if (authSingleton === undefined) {
    const a = getFirebaseApp();
    authSingleton = a ? getAuth(a) : null;
  }
  return authSingleton;
}

export const getFirebaseMessaging = async () => {
  if (typeof window === "undefined") return null;
  const fbApp = getFirebaseApp();
  if (!fbApp) return null;
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(fbApp);
};
