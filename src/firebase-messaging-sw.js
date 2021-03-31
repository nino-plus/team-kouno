importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: 'AIzaSyC8cnvkGPJbFZr7Ru6x1JxGLWmN_EaZTk4',
  authDomain: 'eventstand-3c145.firebaseapp.com',
  projectId: 'eventstand-3c145',
  storageBucket: 'eventstand-3c145.appspot.com',
  messagingSenderId: '667562475069',
  appId: '1:667562475069:web:51bc3ca415cdd3ac29f454',
  measurementId: 'G-BCSGM94VWM',
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});
