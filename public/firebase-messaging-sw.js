importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyBC8C2WjSBYcjJ5TJuWWFBemM-iJkaJiU8",
  authDomain: "saga-learning-to-hero.firebaseapp.com",
  projectId: "saga-learning-to-hero",
  storageBucket: "saga-learning-to-hero.firebasestorage.app",
  messagingSenderId: "1030159539643",
  appId: "1:1030159539643:web:fb08ba6c9d53a02528789e",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

function isValidInternalUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  return trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("://");
}

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload?.notification?.title || payload?.data?.title || "SAGA - Thông báo mới";
  const notificationOptions = {
    body: payload?.notification?.body || payload?.data?.message || "",
    icon: "/favicon.ico",
    data: {
      actionUrl: payload?.data?.actionUrl || null,
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const rawUrl = event.notification?.data?.actionUrl;
  const targetUrl = isValidInternalUrl(rawUrl) ? rawUrl : "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          if (client.url && new URL(client.url).pathname === targetUrl) {
            return client.focus();
          }
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
