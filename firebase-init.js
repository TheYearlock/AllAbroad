
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmTXsBNmQ8LSkEhYfEtz_h0py0jSM1L3k",
  authDomain: "allabroad-3812d.firebaseapp.com",
  projectId: "allabroad-3812d",
  storageBucket: "allabroad-3812d.firebasestorage.app",
  messagingSenderId: "269134466848",
  appId: "1:269134466848:web:849728e50bc9ffde70d145",
  measurementId: "G-675JECEJKJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);