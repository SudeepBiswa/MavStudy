import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, setDoc, updateDoc, getDoc, runTransaction, getDocs, collection } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


window.addEventListener("DOMContentLoaded", () => {

    // if user is NOT authenticated redirect to login page
    onAuthStateChanged(auth, async(user) => {
        
        console.log(user)
        if (!user) {
                window.location.href = "login.html";
            return;
        }

        const lgroupSizeMin = document.getElementById("groupSizeMin");
        const lgroupSizeMax = document.getElementById("groupSizeMax");
        const lgroupAgeMin = document.getElementById("groupAgeMin");
        const lgroupAgeMax = document.getElementById("groupAgeMax");
        const lgroupLocation = document.getElementById("groupLocation");
        const lgroupTags = document.getElementById("groupTags");
        const lgroupDescription = document.getElementById("groupDescription")

        const createGroupBtn = document.getElementById("createGroupButton");

        const groupsContainer = document.querySelector(".groups");
        async function loadPosts() {
            const groupsContainer = document.querySelector(".groups");
            groupsContainer.innerHTML = "<h3>Loading posts...</h3>";

            // Fetch posts from Firestore
            try {
                const querySnapshot = await getDocs(collection(db, "posts"));
                console.log("Fetched posts:", querySnapshot.size);

                if (querySnapshot.empty) {
                    groupsContainer.innerHTML = "<h2>No study groups available right now.</h2>";
                    return;
                }

                groupsContainer.innerHTML = ""; // clear loading text

                // Iterate through posts and display them
                querySnapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    console.log("Post data:", data);

                    const groupDiv = document.createElement("div");
                    groupDiv.classList.add("group");

                    groupDiv.innerHTML = `
                        <div class="groupTitle">
                            <h1>${data.user1?.firstLastName || "Unknown User"}</h1>
                            <h1>${data.groupAgeMin || "?"}-${data.groupAgeMax || "?"}</h1>
                            <h1>${data.groupSizeMin || "?"}/${data.groupSizeMax || "?"}</h1>
                        </div>
                        <div class="groupMembers">
                            <li><a onclick="closeMenu('viewProfile', 'open')">${data.user1?.firstLastName || "Unknown"}</a></li>
                        </div>
                        <div class="groupTags">
                            <h1>${data.groupTags || "No tags"}</h1>
                        </div>
                        <div class="groupDescription">
                            <h1>${data.groupDescription || "No description provided."}</h1>
                        </div>
                    `;

                    groupsContainer.appendChild(groupDiv);
                });

            } catch (err) {
                console.error("Error loading posts:", err);
                groupsContainer.innerHTML = "<h2>Error loading posts</h2>";
            }
        }
        // load posts right away
        await loadPosts();


        createGroupBtn.addEventListener("click", async (event) => {
            event.preventDefault();

            if(lgroupLocation.value == "" || lgroupTags == "" || lgroupDescription.value == ""){
                return;
            }

            const counterRef = doc(db, "metadata", "postCounter")
            const dataRef = await getDoc(doc(db, "users", user.uid));
            const userData = dataRef.data();

            const post = {
                groupSizeMin: lgroupSizeMin.value,
                groupSizeMax: lgroupSizeMax.value,
                groupAgeMin: lgroupAgeMin.value,
                groupAgeMax: lgroupAgeMax.value,
                groupLocation: lgroupLocation.value,
                groupTags: lgroupTags.value,
                groupDescription: lgroupDescription.value,
                user1: {
                    firstLastName: userData.ProfileData.firstName + " " + userData.ProfileData.lastName,
                    enrollStat: userData.ProfileData.enrollmentStatus,
                    pGrade: userData.ProfileData.grade,
                    pMajor: userData.ProfileData.major,
                    pAge: userData.ProfileData.age,
                    email: userData.ProfileData.userEmail
                }
            };

            try{
                await runTransaction(db, async(transaction)=>{
                    const counterSnap = await transaction.get(counterRef);
                    let newPostNumber = 1;

                    if(counterSnap.exists()){
                        const currentCount = counterSnap.data().postNum || 0;
                        newPostNumber = currentCount + 1;
                    }

                    transaction.set(counterRef, {postNum: newPostNumber});

                    const postId = "posts" + newPostNumber;
                    await setDoc(doc(db, "posts", postId), post);
                })
            }
            catch (e){
                console.error("transaction failed.")
            }

            

            
        
        })
    });
});