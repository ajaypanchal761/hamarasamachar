// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5mOi_Czw0N_8AciLQtBE0WIxsVpRENEE",
  authDomain: "hamara-samachar-4b848.firebaseapp.com",
  projectId: "hamara-samachar-4b848",
  storageBucket: "hamara-samachar-4b848.firebasestorage.app",
  messagingSenderId: "307870142478",
  appId: "1:307870142478:web:89b8924dde94e9dbe2ac5f",
  measurementId: "G-27LYLBK5P5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Cloud Messaging
let messaging = null;
try {
  messaging = getMessaging(app);
} catch (error) {
  }

export { messaging, getToken, onMessage };