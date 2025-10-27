import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAlQBcrd1ZUlux5OkRLwgu-_fi1dGI3Y7s",
  authDomain: "bakery-menu-cf3c6.firebaseapp.com",
  projectId: "bakery-menu-cf3c6",
  storageBucket: "bakery-menu-cf3c6.firebasestorage.app",
  messagingSenderId: "796570263573",
  appId: "1:796570263573:web:87ec77122d75372b60ee1c",
  measurementId: "G-K70EX2BXE2",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);