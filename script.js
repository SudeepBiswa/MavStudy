import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, setDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

window.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("userDetailsForm");
    const messageHandler = document.getElementById("messageHandler");
    const submitBtn = document.getElementById("saveUserDetailsButton")

    const convo = document.getElementById("convo");
    const chat =  document.getElementById("chatty")

    const lFirstName = document.getElementById("userFirstName");
    const lLastName = document.getElementById("userLastName");
    const lMajor = document.getElementById("majorDropdown");
    const lGrade = document.getElementById("gradeDropdown");
    const lAge = document.getElementById("ageInput");
    const lEnrollment = document.getElementById("enrollmentStatusDropdown");
    const lGroupSize = document.getElementById("groupSizeDropdown");

    console.log(auth.currentUser)

    

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
            submitBtn.value = "Create Profile"; 
            convo.style.visibility = "hidden";
            chatty.style.visibility = "hidden";
                
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
            lGroupSize.value = userData.ProfileData.groupSize
        }
        
        //stores user details from form
        form.addEventListener("submit", async (event) => {
        event.preventDefault();

        

        const studentData = {
            InitialAccountCreationComplete: true,
            firstName: document.getElementById("userFirstName").value.trim(),
            lastName: document.getElementById("userLastName").value.trim(),
            major: document.getElementById("majorDropdown").value,
            grade: document.getElementById("gradeDropdown").value,
            age: parseInt(document.getElementById("ageInput").value),
            enrollmentStatus: document.getElementById("enrollmentStatusDropdown").value,
            groupSize: parseInt(document.getElementById("groupSizeDropdown").value)
        };
        
        try {
            let canGoToNextPage = false;
            if(!userData.ProfileData.InitialAccountCreationComplete){
                canGoToNextPage = true;
            }
            await updateDoc(doc(db, "users", user.uid), {ProfileData: studentData});
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