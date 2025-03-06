import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDE1F-QII20Iy0G5aa8sD7Wtk2rGFuVeAM",
  authDomain: "ventasrapidas-2ccfb.firebaseapp.com",
  projectId: "ventasrapidas-2ccfb",
  storageBucket: "ventasrapidas-2ccfb.firebasestorage.app",
  messagingSenderId: "1078141243053",
  appId: "1:1078141243053:web:1ae160c5efea8f9cbb0024",
  measurementId: "G-16VZKVXG36"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);