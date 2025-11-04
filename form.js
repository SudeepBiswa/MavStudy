import { auth, db } from "./firebase-init.js";
import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { addDoc, collection, serverTimestamp, setDoc, doc, getFirestore} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

//text
const messageHandler = document.getElementById("messageHandler");

const createButton = document.getElementById("createButton");

 const ProfileData = {
            InitialAccountCreationComplete: false,
            firstName: "",
            lastName: "",
            major: "",
            grade: "",
            age: null,
            enrollmentStatus: "",
            groupSize: "",
            accountCreationDate: new Date()
        };

//buttons
createButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
    if (!(email.endsWith("@unomaha.edu") || email.endsWith("@nebraska.edu"))) {
        messageHandler.style.color = "red";
        messageHandler.textContent = "Please use a valid UNO or Nebraska email.";
        return;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
   
        
        
    await setDoc(doc(db, "users", user.uid), {ProfileData});

    messageHandler.style.color = "green";
    messageHandler.textContent = "Account created";
    
    // log signup event
    //await addEvent(user, "signUp");

    setTimeout(() => { window.location.href = "profile.html"; }, 1000);

} catch (error) {
    messageHandler.style.color = "red";
    messageHandler.textContent = error.message;
}

});

//right now this button works to sign out the current user
const loginButton = document.getElementById("loginButton");
loginButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    //login feature
    if (!email || !password){
        messageHandler.textContent = "Please enter both email and password!";
        messageHandler.style.color = "red";
        return;
    }

    try{
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const user = userCred.user;
        const ref = await getDoc(doc(db, "users", user.uid));
        if(!ref){
            messageHandler.textContent = "UserData DOES NOT EXIST: CREATING USERDATA!!";
            messageHandler.style.color = "yellow";
            setTimeout(() => {
                messageHandler.textContent = "USERDATA CREATED!!";
                messageHandler.style.color = "green";
            }, 1000)
            await setDoc(ref, {ProfileData});
           
        }

        messageHandler.textContent = "Login Successful!"
        messageHandler.style.color = "green";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    }
    catch (error){
        messageHandler.textContent = error.message;
        messageHandler.style.color = "red";
    }
   //logout feature
    // try {
    //     await signOut(auth);
    //     console.log("Signed out successfully");
    // } catch (error) {
    //     console.error("Error signing out:", error);
    // }

});

//creates collection for user events with timestamp
async function addEvent(user, eventType) {
    await addDoc(collection(db, "users", user.uid, "Events"), {
        event: eventType,
        time: serverTimestamp()
    });
}
