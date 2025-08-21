
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

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
const analytics = getAnalytics(app);
export const auth = getAuth(app);
