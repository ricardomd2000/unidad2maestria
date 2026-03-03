import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBA8YmprgycPfClE9o2M1p8befxh-d4tiY",
  authDomain: "unidad2maestria.firebaseapp.com",
  projectId: "unidad2maestria",
  storageBucket: "unidad2maestria.firebasestorage.app",
  messagingSenderId: "999773546679",
  appId: "1:999773546679:web:a0fac0d6126fc9ef6f8532",
  measurementId: "G-53Y5HSZYX7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.firebaseApp = app;
window.auth = auth;
window.db = db;

export { app, auth, db };
