import type { FirebaseApp } from "firebase/app";
import type { Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export async function getFirebaseApp(): Promise<FirebaseApp | null> {
  if (typeof window === "undefined") {
    return null;
  }
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    return null;
  }
  const { initializeApp, getApps, getApp } = await import("firebase/app");
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
    const { isSupported } = await import("firebase/messaging");
    return await isSupported();
  } catch {
    return false;
  }
}

export async function getInstallationId(): Promise<string | null> {
  const app = await getFirebaseApp();
  if (!app) return null;
  try {
    const { getInstallations, getId } = await import("firebase/installations");
    const installations = getInstallations(app);
    return await getId(installations);
  } catch {
    return null;
  }
}

export async function getFcmRegistrationToken(
  swRegistration?: ServiceWorkerRegistration
): Promise<string | null> {
  const app = await getFirebaseApp();
  if (!app) return null;

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) return null;

  try {
    const { getMessaging, getToken } = await import("firebase/messaging");
    const messaging = getMessaging(app);
    return await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });
  } catch {
    return null;
  }
}

export async function deletePushToken(): Promise<boolean> {
  const app = await getFirebaseApp();
  if (!app) return false;
  try {
    const { getMessaging, deleteToken } = await import("firebase/messaging");
    const messaging = getMessaging(app);
    return await deleteToken(messaging);
  } catch {
    return false;
  }
}

export async function getClientMessaging(): Promise<Messaging | null> {
  const app = await getFirebaseApp();
  if (!app) return null;
  try {
    const { getMessaging } = await import("firebase/messaging");
    return getMessaging(app);
  } catch {
    return null;
  }
}
