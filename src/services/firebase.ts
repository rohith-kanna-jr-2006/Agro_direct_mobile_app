// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD1y6tLKBUaLU_CWkmMy8Xiuyg8tYc1mWI",
    authDomain: "farmdirect-ae352.firebaseapp.com",
    projectId: "farmdirect-ae352",
    storageBucket: "farmdirect-ae352.firebasestorage.app",
    messagingSenderId: "45484952561",
    appId: "1:45484952561:web:9e56c0d278eb1797e09250",
    measurementId: "G-M904FLK44J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { analytics, app, auth };

