// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration for vastraa-c7da1
const firebaseConfig = {
  apiKey: "AIzaSyALS7GrNslShd2Zy3t-kB1BmNsNmPNlw18",
  authDomain: "vastraa-c7da1.firebaseapp.com",
  projectId: "vastraa-c7da1",
  storageBucket: "vastraa-c7da1.firebasestorage.app",
  messagingSenderId: "422113852506",
  appId: "1:422113852506:web:35ebcfca7c8f7203666c63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const fireDB = getFirestore(app);
const auth = getAuth(app);

export { fireDB, auth };
