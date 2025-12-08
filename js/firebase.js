import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyArZmilSAczm7yThegGQBCYvu7dWhppwhQ",
  authDomain: "linuxtodolist.firebaseapp.com",
  projectId: "linuxtodolist",
  storageBucket: "linuxtodolist.firebasestorage.app",
  messagingSenderId: "477421540906",
  appId: "1:477421540906:web:7292d315ce10bd12ce9553",
  measurementId: "G-N66ES3KBNT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
