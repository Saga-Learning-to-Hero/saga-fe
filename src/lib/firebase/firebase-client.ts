import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getInstallations, getId as getFirebaseInstallationId } from "firebase/installations";
import {
  getMessaging,
  getToken as getFcmToken,
  deleteToken as deleteFcmToken,
  isSupported as isFcmSupported,
  type Messaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    return null;
  }
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

export async function isFirebaseMessagingSupported(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }
  if (!("serviceWorker" in navigator) || !("Notification" in window)) {
    return false;
  }
  try {
    return await isFcmSupported();
  } catch {
    return false;
  }
}

export async function getInstallationId(): Promise<string | null> {
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    const installations = getInstallations(app);
    return await getFirebaseInstallationId(installations);
  } catch {
    return null;
  }
}

export async function getFcmRegistrationToken(
  swRegistration?: ServiceWorkerRegistration
): Promise<string | null> {
  const app = getFirebaseApp();
  if (!app) return null;

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) return null;

  try {
    const messaging = getMessaging(app);
    return await getFcmToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });
  } catch {
    return null;
  }
}

export async function deletePushToken(): Promise<boolean> {
  const app = getFirebaseApp();
  if (!app) return false;
  try {
    const messaging = getMessaging(app);
    return await deleteFcmToken(messaging);
  } catch {
    return false;
  }
}

export function getClientMessaging(): Messaging | null {
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    return getMessaging(app);
  } catch {
    return null;
  }
}
