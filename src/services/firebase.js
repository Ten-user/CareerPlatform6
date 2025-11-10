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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { auth, db, storage, analytics };
