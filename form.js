
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js"
import { getAuth, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js"
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js"; // <-- added Firestore


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
const auth = getAuth(app)
const db = getFirestore(app);

//text
const messageHandler = document.getElementById("messageHandler")

//buttons
const createButton = document.getElementById("createButton")
createButton.addEventListener("click", function (event) {
    event.preventDefault()
    const email = document.getElementById("email").value.trim()
    const password = document.getElementById("password").value.trim()

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            messageHandler.style.color = "green"
            messageHandler.textContent = "account created"
        }).then(() => {
            if (email.endsWith("@unomaha.edu")) {
                const userData = {email: email, password: password};
                addUser(userData);
            } else {
                messageHandler.style.color = "red"
                messageHandler.textContent = "Please use a valid UNO email."
            }           
        })
        .catch((error) => {
            const errorCode = error.code
            const errorMessage = error.message
            console.log(errorMessage)
            messageHandler.textContent = errorMessage
            messageHandler.style.color = "red"
            // ..
        });
})

//right now this button works to sign out the current user
const loginButton = document.getElementById("loginButton")
loginButton.addEventListener("click", function (event) {
    event.preventDefault()

    signOut(auth).then(() => {
        console.log("Signed out successfully")
    }).catch((error) => {
        console.error("Error signing out:", error)
    })
})

async function addUser(data) {
    const docRef = await addDoc(collection(db, "users"), data);
}