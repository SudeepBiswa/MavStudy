import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, setDoc, updateDoc, getDoc, runTransaction, getDocs, collection } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


window.addEventListener("DOMContentLoaded", () => {

    // if user is NOT authenticated redirect to login page
    onAuthStateChanged(auth, async(user) => {
        
        //console.log(user)
        if (!user) {
                window.location.href = "login.html";
            return;
        }

        const lgroupSizeMin = document.getElementById("groupSizeMin");
        const lgroupSizeMax = document.getElementById("groupSizeMax");
        const lgroupAgeMin = document.getElementById("groupAgeMin");
        const lgroupAgeMax = document.getElementById("groupAgeMax");
        const lgroupLocation = document.getElementById("groupLocation");
        const lgroupTags = document.getElementById("taggy");
        const lgroupDescription = document.getElementById("groupDescription")

        const createGroupBtn = document.getElementById("createBtn");
        const cancelBtn = document.getElementById("cancelBtn");

        createGroupBtn.addEventListener("click", async (event) => {
            event.preventDefault();
            //console.log("testing")

            if(lgroupLocation.value == "" || lgroupTags.value == "" || lgroupDescription.value == ""){
                return;
            }
            //console.log("got past it")
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
                    //console.log("postId")
                    await setDoc(doc(db, "posts", postId), post);
                    document.getElementById("createGroup").style.display = "none";
                })
            }
            catch (e){
                console.error("transaction failed.")
            }
        })

        let arrPostsStack = [];
        let arrFirst =[];
        let currentPostIndex = 1;

        const seenIds = new Set();  

        const postsRef = collection(db, "posts");
        const snapshot = await getDocs(postsRef);
        //const posts = snapshot.docs.map(doc =>({id: doc.id,...doc.data()}));
        if(snapshot.empty){
            console.log("no posts found");
        }
        else{
            const docArr = snapshot.docs;

            const shuffled = docArr.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, Math.min(3, docArr.length));
            arrPostsStack = selected;
            selected.forEach(element => seenIds.add(element.id))
            console.log(seenIds)

            //console.log("Initial Stack: " + arrPostsStack);
        }
        
        // const groupsContainer = document.querySelector(".groups");
        // async function loadPosts(arrPosts) {
        //     console.log("we got here!")
        //     const groupsContainer = document.querySelector(".groups");
        //     groupsContainer.innerHTML = "<h3>Loading posts...</h3>";

        //     // Fetch posts from Firestore
        //     try {
        //         //const querySnapshot = await getDocs(collection(db, "posts"));
        //         //console.log("Fetched posts:", querySnapshot.size);

        //         if (arrPosts.length <= 0) {
        //             groupsContainer.innerHTML = "<h2>No study groups available right now.</h2>";
        //             return;
        //         }

        //         groupsContainer.innerHTML = ""; // clear loading text

        //         // Iterate through posts and display them
        //         arrPosts.forEach((docSnap) => {
        //             const data = docSnap.data();
        //             //console.log("Post data:", data);

        //             const groupDiv = document.createElement("div");
        //             groupDiv.classList.add("group");

        //             groupDiv.innerHTML = `
        //                 <div class="groupTitle">
        //                     <h1>${data.user1?.firstLastName || "Unknown User"}</h1>
        //                     <h1>${data.groupAgeMin || "?"}-${data.groupAgeMax || "?"}</h1>
        //                     <h1>${data.groupSizeMin || "?"}/${data.groupSizeMax || "?"}</h1>
        //                 </div>
        //                 <div class="groupMembers">
        //                     <li><a onclick="closeMenu('viewProfile', 'open')">${data.user1?.firstLastName || "Unknown"}</a></li>
        //                 </div>
        //                 <div class="groupTags">
        //                     <h1>${data.groupTags || "No tags"}</h1>
        //                 </div>
        //                 <div class="groupDescription">
        //                     <h1>${data.groupDescription || "No description provided."}</h1>
        //                 </div>
        //             `;

        //             groupsContainer.appendChild(groupDiv);
        //         });

        //     } catch (err) {
        //         console.error("Error loading posts:", err);
        //         groupsContainer.innerHTML = "<h2>Error loading posts</h2>";
        //     }
        // }
        // load posts right away

        
        fillArr();
        function fillArr(){
             if(arrPostsStack.length >= 3){
                arrFirst = [arrPostsStack[currentPostIndex-1], arrPostsStack[currentPostIndex], arrPostsStack[currentPostIndex+1]]
            }
            else if(arrPostsStack == 2){
                arrFirst = [arrPostsStack[currentPostIndex-1], arrPostsStack[currentPostIndex]]
            }
            else{
                arrFirst = arrPostsStack;
            }
        }
        

        //console.log(arrFirst)

        const groupt = document.getElementById("groupTitle")

        
        //groups[0].querySelector(".groupTitle");

        function fillData(index, data){
            const groups = document.querySelectorAll(".group");
            const group = groups[index];

            const groupTitles = group.querySelectorAll(".groupTitle h1");

            groupTitles[0].textContent = data.user1?.firstLastName || "Unknown User";
            groupTitles[1].textContent = ("Age:" + data.groupAgeMin || "Age: N/A")+"-"+ (data.groupAgeMax || "Age: N/A");
            groupTitles[2].textContent = (data.groupSizeMin || "N/A") + "/" + (data.groupSizeMax || "N/A")

            const memberLinks = group.querySelectorAll(".groupMembers a");
            memberLinks[0].textContent = data.user1?.firstLastName || "Unknown";

            const ltag = group.querySelectorAll(".groupTags h1");
            ltag[0].textContent = data.groupTags;

            const desc = group.querySelectorAll(".groupDescription h1");
            desc[0].textContent = data.groupDescription;
        }
        async function fillPosts(arrPost){
            
            const len = arrPost.length;
            if(arrPost.length >= 3){
                for(let i = 0; i<=2; i++){
                    //console.log(arrPost[i].data())
                    const data = arrPost[i].data();
                    fillData(i, data);
                }
            }
            else if(arrPost.length == 2){
                for(let i = 0; i<=1; i++){
                    //console.log(arrPost[i].data())
                    const data = arrPost[i].data();
                    fillData(i, data);
                }
            }
            else{
                fillData(1, arrPost[0].data());
            }
            
            
        }

        await fillPosts(arrFirst);
        const prevbtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");

        nextBtn.addEventListener("click", async(event) =>{

            const postsCol = collection(db, "posts");
            const counterRef = doc(db, "metadata", "postCounter");

            const counterSnap = await getDoc(counterRef);
            const totalPosts = counterSnap.data()?.postNum || 0;

            if (totalPosts === 0) return null;
            if (seenIds.size >= totalPosts) return null;

            
            let idx = 1 + Math.floor(Math.random() * totalPosts);

            
            for (let tries = 0; tries < totalPosts; tries++) {
                const postId = `posts${idx}`;

                if (!seenIds.has(postId)) {
                const snap = await getDoc(doc(db, "posts", postId));
                if (snap.exists()) {
                    seenIds.add(postId);
                    arrPostsStack.push(snap);
                    //console.log(arrPostsStack);
                    currentPostIndex += 1;
                    fillArr();
                    fillPosts(arrFirst);
                    return; 
                    }
                }
                idx = idx === totalPosts ? 1 : idx + 1;
            }
            return null;
        })

        prevbtn.addEventListener("click", async(event) => {
            if (currentPostIndex - 1 <= 0){
                return;
            }
            currentPostIndex -= 1;
            fillArr();
            fillPosts(arrFirst);        
        })
        
        //await loadPosts(arrFirst);


        
    });
});