// Firebase Web Configuration
// Note: Client-side Firebase configuration values (apiKey, authDomain, projectId)
// are non-secret public identifiers used by web clients.
// Database security is enforced on the server via Firestore Security Rules & Admin Auth.

const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForPublicClient-ConfiguredInDashboard",
  authDomain: "ieee-cs-nirma.firebaseapp.com",
  projectId: "ieee-cs-nirma",
  storageBucket: "ieee-cs-nirma.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase if available
if (typeof firebase !== 'undefined' && firebase.initializeApp) {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  window.db = firebase.firestore();
  window.auth = firebase.auth();
}
