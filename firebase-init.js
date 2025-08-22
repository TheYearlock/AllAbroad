
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmTXsBNmQ8LSkEhYfEtz_h0py0jSM1L3k",
  authDomain: "allabroad-3812d.firebaseapp.com",
  projectId: "allabroad-3812d",
  storageBucket: "allabroad-3812d.appspot.com",
  messagingSenderId: "269134466848",
  appId: "1:269134466848:web:849728e50bc9ffde70d145",
  measurementId: "G-675JECEJKJ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);