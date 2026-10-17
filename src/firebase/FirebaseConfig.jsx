// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBw94fJQrF9UUY_fnXTXnStJe3fDdpo9w4",
  authDomain: "virtual-fashion-studio-5d8c9.firebaseapp.com",
  projectId: "virtual-fashion-studio-5d8c9",
  storageBucket: "virtual-fashion-studio-5d8c9.firebasestorage.app",
  messagingSenderId: "597120741257",
  appId: "1:597120741257:web:396ba099b80ed3d6367b58"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const fireDB = getFirestore(app);
const auth = getAuth(app);

export { fireDB, auth };
