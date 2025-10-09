// Import the functions you need from the SDKs you need
import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js"
import {getAuth} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js"
import {getFirestore} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA802cjxiStUiS1K70YqroL77yZrsMWq2s",
    authDomain: "mavstudy-ab1ae.firebaseapp.com",
    projectId: "mavstudy-ab1ae",
    storageBucket: "mavstudy-ab1ae.firebasestorage.app",
    messagingSenderId: "973498407914",
    appId: "1:973498407914:web:d3faf56890d82073ea3093"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app);