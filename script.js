import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("userDetailsForm");
    const messageHandler = document.getElementById("messageHandler");

    // if user is NOT authenticated redirect to login page
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        //stores user details from form
        form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const studentData = {
            firstName: document.getElementById("userFirstName").value.trim(),
            lastName: document.getElementById("userLastName").value.trim(),
            major: document.getElementById("majorDropdown").value,
            grade: document.getElementById("gradeDropdown").value,
            age: parseInt(document.getElementById("ageInput").value),
            enrollmentStatus: document.getElementById("enrollmentStatusDropdown").value,
            groupSize: parseInt(document.getElementById("groupSizeDropdown").value)
        };
        
        try {
            await setDoc(doc(db, "users", user.uid), studentData);
            messageHandler.style.color = "green";
            messageHandler.textContent = "User details saved successfully!";
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