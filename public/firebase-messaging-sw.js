// Firebase Messaging Service Worker
// Handles BACKGROUND push notifications (when browser tab is not in focus)

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAOSxrMO7lOQcI6QXj29w1EBJKbrr5ZzpE",
  authDomain: "sshub-c4a3e.firebaseapp.com",
  projectId: "sshub-c4a3e",
  storageBucket: "sshub-c4a3e.firebasestorage.app",
  messagingSenderId: "924688391302",
  appId: "1:924688391302:web:3edf115b697eb9a56cc507",
});

const messaging = firebase.messaging();

// Handle background push notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'SSHUB.STORE';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — open URL if provided
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.openWindow(url)
  );
});
