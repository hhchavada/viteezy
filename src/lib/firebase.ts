// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCwpkIQth-UEyp-9sx-v0FIVnPPKXmeRgQ",
    authDomain: "viteezy-mobile.firebaseapp.com",
    projectId: "viteezy-mobile",
    storageBucket: "viteezy-mobile.firebasestorage.app",
    messagingSenderId: "26828450688",
    appId: "1:26828450688:web:5d0ee7edc6d754da38ef65",
    measurementId: "G-DZZ3PZFCFP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only on client side)
let analytics;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

export { app, analytics, auth, googleProvider, appleProvider };
