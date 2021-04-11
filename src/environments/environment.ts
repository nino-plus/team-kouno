// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyC8cnvkGPJbFZr7Ru6x1JxGLWmN_EaZTk4',
    authDomain: 'eventstand-3c145.firebaseapp.com',
    projectId: 'eventstand-3c145',
    storageBucket: 'eventstand-3c145.appspot.com',
    messagingSenderId: '667562475069',
    appId: '1:667562475069:web:51bc3ca415cdd3ac29f454',
    measurementId: 'G-BCSGM94VWM',
    databaseURL: 'https://eventstand-3c145-default-rtdb.firebaseio.com',
  },
  agora: {
    appId: '60c972e80bee423ea01a8ca67121691d',
  },
  algolia: {
    appId: 'JKOSWPL40A',
    searchKey: '0615dae3a9591145ccd4460d77f874a7',
  },
  stripe: {
    publicKey:
      'pk_test_51IcXWzJ6xR3ewndOMvZOAN41FWt68ifzl2zkZNphWjqj1hH9rOKdZaXfSJThqIUOLcWjvIcjAbKazzWaBjhUoQuk00wR5XrQyG',
    clientId: 'ca_JHR1EBPQBrX4pgL8tBpxhyqnfi8ORnay',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
