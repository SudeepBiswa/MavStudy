import { auth, db, storage} from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, setDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";


window.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("userDetailsForm");
    const messageHandler = document.getElementById("messageHandler");
    const submitBtn = document.getElementById("saveUserDetailsBtn");

    const convoBtn = document.getElementById("convoBtn");
    const homeBtn =  document.getElementById("homeBtn");
    const imgHomeBtn = document.getElementById("profileHomeBtn");

    const lFirstName = document.getElementById("userFirstName");
    const lLastName = document.getElementById("userLastName");
    const lMajor = document.getElementById("majorDropdown");
    const lGrade = document.getElementById("gradeDropdown");
    const lAge = document.getElementById("ageInput");
    const lEnrollment = document.getElementById("enrollmentStatusDropdown");

    const userPfp = document.getElementById("userProfilePicture");

    //console.log(auth.currentUser)

    

    // if user is NOT authenticated redirect to login page
    onAuthStateChanged(auth, async(user) => {
        
        console.log(user)
        if (!user) {
                window.location.href = "login.html";
            return;
        }

        const dataRef = await getDoc(doc(db, "users", user.uid));
        const userData = dataRef.data();

        //console.log(user.uid)
        //console.log(userData.ProfileData.firstName)

        if(!userData.ProfileData.InitialAccountCreationComplete){
            submitBtn.textContent = "Create Profile"; 
            convoBtn.style.visibility = "hidden";
            homeBtn.style.visibility = "hidden";
            imgHomeBtn.href = "";
                
        }
        else{
            lFirstName.value = userData.ProfileData.firstName
            lFirstName.readOnly = true;
            lLastName.value = userData.ProfileData.lastName
            lLastName.readOnly = true;
            lMajor.value = userData.ProfileData.major
            lGrade.value = userData.ProfileData.grade
            lAge.value = userData.ProfileData.age
            lEnrollment.value = userData.ProfileData.enrollmentStatus
        }
        
        //stores user details from form
        submitBtn.addEventListener("click", async (event) => {
        event.preventDefault();

        // const file = userPfp.files[0];
        // if (!file) {
        //     alert("Please select a file first.");
        //     return;
        // }

        // try {
        //     // Create a reference: users/<uid>/profile.jpg
        //     const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);

        //     // Upload the file
        //     await uploadBytes(storageRef, file);
        //     console.log("File uploaded successfully");

        //     // Get the download URL
        //     const downloadURL = await getDownloadURL(storageRef);
        //     console.log("📸 Profile picture URL:", downloadURL);

        //     // Store the URL in Firestore (e.g., inside your users collection)
        //     const userDocRef = doc(db, "users", user.uid);
        //     await setDoc(userDocRef, {
        //     "ProfileData.profilePicURL": downloadURL
        //     }, {merge: true});

        //     alert("Profile picture uploaded successfully!");
        // } catch (error) {
        //     console.error("Upload failed:", error);
        //     alert("Error uploading profile picture: " + error.message);
        // }

        

        const studentData = {
            InitialAccountCreationComplete: true,
            firstName: document.getElementById("userFirstName").value.trim(),
            lastName: document.getElementById("userLastName").value.trim(),
            major: document.getElementById("majorDropdown").value,
            grade: document.getElementById("gradeDropdown").value,
            age: parseInt(document.getElementById("ageInput").value),
            enrollmentStatus: document.getElementById("enrollmentStatusDropdown").value
        };
        
        try {
            let canGoToNextPage = false;
            if(!userData.ProfileData.InitialAccountCreationComplete){
                canGoToNextPage = true;
            }
            await setDoc(doc(db, "users", user.uid), {ProfileData: studentData}, {merge: true});
            messageHandler.style.color = "green";
            if(canGoToNextPage){
                messageHandler.textContent = "PROFILE CREATED!!";
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
            }
            else{
                messageHandler.textContent = "User details saved successfully!";
            }
        } catch (error) {
            messageHandler.style.color = "red";
            messageHandler.textContent = error.message;
        }
        });

        const ageInput = document.getElementById("ageInput");
        ageInput.addEventListener("change", () => {
        const value = Number(ageInput.value);
        if (!Number.isFinite(value) || value < 18 || value > 99) {
            ageInput.value = "";
        }
        });
    });

    window.changeRoomsViewerMenu = function(option, event) {
        const menuItems = document.querySelectorAll(".roomsViewerMenu h1");
        menuItems.forEach(item => item.classList.remove("selected"));
        event.target.classList.add("selected");
    }
});