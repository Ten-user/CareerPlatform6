// frontend/src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD3kWBiZ2qznhP4VKJfKuOGxHiWsK4jI3Y",
  authDomain: "career-d232c.firebaseapp.com",
  projectId: "career-d232c",
  storageBucket: "career-d232c.appspot.com",
  messagingSenderId: "488035651405",
  appId: "1:488035651405:web:14d669c688ae74fa773104",
  measurementId: "G-VK6M68GG4K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
