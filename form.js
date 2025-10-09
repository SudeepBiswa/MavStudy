import { auth, db } from "./firebase-init.js";
import { createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

//text
const messageHandler = document.getElementById("messageHandler");

const createButton = document.getElementById("createButton");

//buttons
createButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!(user.email.endsWith("@unomaha.edu") || user.email.endsWith("@nebraska.edu"))) {
            messageHandler.style.color = "red";
            messageHandler.textContent = "Please use a valid UNO or Nebraska email.";
            return;
        }

        messageHandler.style.color = "green";
        messageHandler.textContent = "Account created";
        //login registry
        await addEvent(user, "signUp");

        setTimeout(() => { window.location.href = "welcome.html"; }, 1000);
    } catch (error) {
        messageHandler.style.color = "red";
        messageHandler.textContent = error.message;
    }
});

//right now this button works to sign out the current user
const loginButton = document.getElementById("loginButton");
loginButton.addEventListener("click", async (event) => {
    event.preventDefault();

    try {
        await signOut(auth);
        console.log("Signed out successfully");
    } catch (error) {
        console.error("Error signing out:", error);
    }
});

//creates collection for user events with timestamp
async function addEvent(user, eventType) {
    await addDoc(collection(db, "users", user.uid, "Events"), {
        event: eventType,
        time: serverTimestamp()
    });
}
