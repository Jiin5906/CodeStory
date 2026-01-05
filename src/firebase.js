
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB8mrzA_iN18ITmz9qjUWtlqr5WXyzjOWU",
  authDomain: "codestory-1ce3f.firebaseapp.com",
  projectId: "codestory-1ce3f",
  storageBucket: "codestory-1ce3f.firebasestorage.app",
  messagingSenderId: "256329277584",
  appId: "1:256329277584:web:c24636b63fc76bc4997815",
  measurementId: "G-FX2Z0ZWJDW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);