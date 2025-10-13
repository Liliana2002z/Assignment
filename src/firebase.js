import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDvPFxgp2U-49NYeC-Wnz6OEbd9t2nIXd0",
  authDomain: "a-a5d64.firebaseapp.com",
  projectId: "a-a5d64",
  storageBucket: "a-a5d64.firebasestorage.app",
  messagingSenderId: "908098308075",
  appId: "1:908098308075:web:c15352926138cd48effbae"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };