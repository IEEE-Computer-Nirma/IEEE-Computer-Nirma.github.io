// Shared Firebase app instance.
// NOTE: this project's Firestore ("contact-us-6b48d") looks like it may be
// shared across more than one client site. Every document written from this
// site is tagged with CLIENT_ID below and every read is filtered by it, so
// it's safe to keep using the same Firebase project — just don't change
// CLIENT_ID unless you also update it everywhere it's read.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

export const CLIENT_ID = 'ieee-nirma-hackathon';

const firebaseConfig = {
  apiKey: 'AIzaSyC8M6HHE_-yOnXVqZvawrj1inalnjaQkYg',
  authDomain: 'contact-us-6b48d.firebaseapp.com',
  projectId: 'contact-us-6b48d',
  storageBucket: 'contact-us-6b48d.firebasestorage.app',
  messagingSenderId: '630067730378',
  appId: '1:630067730378:web:4a8e8af3620a3c33c22133',
  measurementId: 'G-6Z291TVLG3',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
