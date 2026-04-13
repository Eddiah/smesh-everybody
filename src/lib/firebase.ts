import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAWmLZys9lbH5IYOTjZFHbyt0NTdpjKfHA",
  authDomain: "smesh-everybody.firebaseapp.com",
  projectId: "smesh-everybody",
  storageBucket: "smesh-everybody.firebasestorage.app",
  messagingSenderId: "767791181149",
  appId: "1:767791181149:web:9834d6ad1263162b824cb4",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
