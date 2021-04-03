importScripts('https://www.gstatic.com/firebasejs/8.3.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.3.1/firebase-messaging.js');

firebase.initializeApp({
  apiKey: 'AIzaSyC8cnvkGPJbFZr7Ru6x1JxGLWmN_EaZTk4',
  authDomain: 'eventstand-3c145.firebaseapp.com',
  projectId: 'eventstand-3c145',
  storageBucket: 'eventstand-3c145.appspot.com',
  messagingSenderId: '667562475069',
  appId: '1:667562475069:web:51bc3ca415cdd3ac29f454',
  measurementId: 'G-BCSGM94VWM',
  databaseURL: 'https://eventstand-3c145-default-rtdb.firebaseio.com',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});

self.addEventListener('install', function(event) {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');
});
