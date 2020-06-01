import firebase from 'firebase/app'
import 'firebase/storage'

var firebaseConfig = {
    apiKey: window._env_.apiKey,
    authDomain: window._env_.authDomain,
    databaseURL: window._env_.databaseURL,
    projectId: window._env_.projectId,
    storageBucket: window._env_.storageBucket,
    messagingSenderId: window._env_.messagingSenderId,
    appId: window._env_.appId
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const storage = firebase.storage()

  export  {
    storage, firebase as default
  }