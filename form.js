import { auth, db } from "./firebase-init.js";
import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword, setPersistence, browserSessionPersistence, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { addDoc, collection, serverTimestamp, setDoc, doc, getFirestore, getDoc} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

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
console.log(auth)
//buttons
createButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    try {
    if (!(email.endsWith("@unomaha.edu") || email.endsWith("@nebraska.edu"))) {
        messageHandler.style.color = "red";
        messageHandler.textContent = "Please use a valid UNO or Nebraska email.";
        return;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
   
        
        
    await setDoc(doc(db, "users", user.uid), {ProfileData}, {merge: true});

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

    try{
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value.trim();
        console.log(email + " " + password)

        //console.log(auth.currentUser)

        //login feature
        // if (!email || !password){
        //     messageHandler.textContent = "Please enter both email and password!";
        //     messageHandler.style.color = "red";
        //     return;
        // }
        console.log(auth)
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const user = userCred.user;
        console.log("all good 2")

        const ref = await getDoc(doc(db, "users", user.uid));
        if(!ref.exists()){
            messageHandler.textContent = "UserData DOES NOT EXIST: CREATING USERDATA!!";
            messageHandler.style.color = "yellow";
            await setDoc(ref, {ProfileData});
            setTimeout(() => {
                messageHandler.textContent = "USERDATA CREATED!!";
                messageHandler.style.color = "green";
            }, 1000)
            
           
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
