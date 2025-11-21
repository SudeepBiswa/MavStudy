import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, setDoc, updateDoc, getDoc, runTransaction, getDocs, collection, serverTimestamp, addDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


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
        //const cancelBtn = document.getElementById("cancelBtn");
        const prevbtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");

        const groupsContainer = document.getElementById("groupCont");

        createGroupBtn.addEventListener("click", async (event) => {
            event.preventDefault();
            //console.log("testing")

            if(lgroupLocation.value == "" || lgroupTags.value == "" || lgroupDescription.value == ""){
                return;
            }
            //console.log("got past it")
            const counterRef = doc(db, "metadata", "postCounter")
            const chatCounterRef = doc(db, "metadata", "chatsCounter");
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
            const message1 = {
                creationDate: serverTimestamp(), 
                sender: userData.ProfileData.firstName + " " + userData.ProfileData.lastName,
                senderEmail: userData.ProfileData.userEmail,
                message: "Welcome Everyone!!"
            }

            try{
                await runTransaction(db, async(transaction)=>{
                    
                    const ccounterSnap = await transaction.get(chatCounterRef);
                    let newChatNumber = 1;

                    if(ccounterSnap.exists()){
                        const currentChatCount = ccounterSnap.data().chatNum || 0;
                        newChatNumber = currentChatCount + 1;
                    }

                    transaction.set(chatCounterRef, {chatNum: newChatNumber});

                    const chatId = "chats" + newChatNumber;
                    const chatIDName = "chatName" + newChatNumber;
                    await setDoc(doc(db, "chats", chatId), {members: {user1: userData.ProfileData.firstName}, chatName: userData.ProfileData.firstName + "' Chat", messageCounter: 1,});
                    const messagesRef = collection(db, "chats", chatId, "messages");
                    await addDoc(messagesRef, {creationDate: serverTimestamp(), 
                        sender: userData.ProfileData.firstName + " " + userData.ProfileData.lastName,
                        senderEmail: userData.ProfileData.userEmail,
                        message: "Welcome Everyone!!"})
                    await setDoc(doc(db, "users", user.uid), {userChats: {[chatId]: chatId}}, {merge: true})
                    
                })
            }
            catch (e){
                console.error("chat transaction failed.\n" + e)
            }

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
                    window.location.reload();
                })
            }
            catch (e){
                console.error("post transaction failed.")
            }
        })

        let arrPostsStack = [];
        //let arrFirst =[];
        let currentPostIndex = 0;
        const seenIds = new Set();  

        const postsRef = collection(db, "posts");
        const snapshot = await getDocs(postsRef);
        
        if(snapshot.empty){
            console.log("no posts found");
            groupsContainer.innerHTML = '<p>NO AVAILABLE POSTS</p>'
            const p = groupsContainer.querySelector("p");
            groupsContainer.style.display = "flex";
            groupsContainer.style.justifyContent = "center";
            groupsContainer.style.alignItems = "center";
            p.style.fontSize = "2rem";     
            p.style.color = "grey";        
            p.style.fontWeight = "bold";
        }
        else{
            const docArr = snapshot.docs;

            const shuffled = docArr.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, Math.min(3, docArr.length));
            arrPostsStack = selected;
            selected.forEach(element => seenIds.add(element.id))
            //console.log(seenIds)

            //console.log("Initial Stack: " + arrPostsStack);
        }

        //console.log(arrPostsStack)
        function wait(ms){
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        const groups = document.querySelectorAll(".group");
        async function fillData(){
            for(let i = 0; i<3; i++){
                let data = null;
                const group = groups[i];
                if(arrPostsStack.length <= 0){
                    return;
                }
                if((arrPostsStack.length == 1)){
                    //There is only one post, show only the middle div
                    if((i == 0 || i == 2)){
                        group.style.display = "none";
                        continue;
                    }else{
                        //group.style.scale = "0.85";
                        group.style.width = "50%";
                        nextBtn.style.display="none";
                        prevbtn.style.display="none";
                        data = arrPostsStack[currentPostIndex].data();
                    }
                }
                else if((arrPostsStack.length ==2) ){
                    //if there is 2 posts and we are on the 0th post, show only the middle and right posts
                    if(i == 0){
                        group.style.display = "none";
                    continue;
                    }else{
                        if(currentPostIndex == 0){
                            if(i == 1){
                                group.style.scale = "1";
                                group.style.filter= "";
                                data = arrPostsStack[currentPostIndex].data();
                            }else{
                                group.style.scale = "0.85";
                                group.style.filter= "blur(1.2px) brightness(0.45)";
                                data = arrPostsStack[currentPostIndex+1].data();
                            }
                            
                        }
                        else{
                             if(i == 2){
                                group.style.scale = "1";
                                group.style.filter= "";
                                data = arrPostsStack[currentPostIndex].data();
                            }else{
                                group.style.scale = "0.85";
                                group.style.filter= "blur(1.2px) brightness(0.45)";
                                data = arrPostsStack[currentPostIndex-1].data();
                            }
                        }
                        
                    }
                }
                else if(currentPostIndex == 0 && arrPostsStack.length > 2){
                    if(i == 0){
                        group.style.scale = "1"
                        group.style.filter= "";
                        data = arrPostsStack[currentPostIndex].data();
                    }else{
                        group.style.scale = "0.85";
                        group.style.filter= "blur(1.2px) brightness(0.45)";
                        data = arrPostsStack[currentPostIndex + i].data();
                    }
                }
                else if((currentPostIndex == arrPostsStack.length-1) ){
                    //if we are on the last post show only the left and middle post
                    if(i == 2){
                        group.style.scale = "1";
                        group.style.filter= "";
                        data = arrPostsStack[currentPostIndex].data();
                        
                    }
                    else if(i == 0){
                        group.style.scale = "0.85";
                        group.style.filter= "blur(1.2px) brightness(0.45)";
                        data = arrPostsStack[currentPostIndex-2].data();
                    }
                    else{   
                        group.style.scale = "0.85";
                        group.style.filter= "blur(1.2px) brightness(0.45)";
                        data = arrPostsStack[currentPostIndex-1].data();
                    }
                }else if(!(currentPostIndex == arrPostsStack.length-1)){
                    //console.log(currentPostIndex)
                    
                    if(i == 0){
                        data = arrPostsStack[currentPostIndex - 1].data();
                        group.style.scale = "0.85";
                        group.style.filter= "blur(1.2px) brightness(0.45)";
                    }
                    else if( i == 1){
                        data = arrPostsStack[currentPostIndex].data();
                                                
                        group.style.scale = "0.85";
                        await wait(120);
                        
                        group.style.scale = "1";
                        group.style.filter= "";
                    }
                    else if(i==2){
                        data = arrPostsStack[currentPostIndex + 1].data();
                        group.style.scale = "0.85";
                        group.style.filter= "blur(1.2px) brightness(0.45)";
                    }  
                }
                
                
                 
                const groupTitles = group.querySelectorAll(".groupTitle h1");

                groupTitles[0].textContent = data.user1?.firstLastName || "Unknown User";
                groupTitles[3].textContent = ("Age: " + data.groupAgeMin || "Age: NA")+"-"+ (data.groupAgeMax || "Age: NA");
                groupTitles[2].textContent = "Location: " + data.groupLocation || "Unknown";

                const memberContainer = group.querySelector(".groupMembers");
                memberContainer.innerHTML = "";

                const maxMembers = parseInt(data.groupSizeMax) || 1;

                //SUDEEP did a unit test for currentMemSize 
                let currentMemSize = 0;
                for (let m = 1; m <= maxMembers; m++) {
                    const userKey = "user" + m;
                    const member = data[userKey];

                    if (member && member.firstLastName) {
                        const link = document.createElement("a");
                        if(member.firstLastName == " " || member.firstLastName == ""){
                            link.textContent = "Unknown User";
                        }
                        else{
                            link.textContent = member.firstLastName;
                        }
                        memberContainer.appendChild(link);
                        currentMemSize += 1;
                    }
                }
               // console.log("size: " + currentMemSize)
                groupTitles[1].textContent = ( "Size: " + currentMemSize || "NA") + "/" + (data.groupSizeMax || "NA");
                const ltag = group.querySelectorAll(".groupTags h1");
                ltag[0].textContent = data.groupTags || "N/A";

                const desc = group.querySelectorAll(".groupDescription h1");
                desc[0].textContent = data.groupDescription || "N/A";
            }
            
        }
        await fillData();

        // Adds one unique Firestore snapshot (not already in arrPostsStack)
        async function fetchUniquePost() {
            const postsRef = collection(db, "posts");
            const snapshot = await getDocs(postsRef);

            if (snapshot.empty) {
                //console.log("No posts found in Firestore.");
                return null;
            }

            const docs = snapshot.docs;
            let newSnap = null;

            // Try a few random picks to find an unseen post
            for (let tries = 0; tries < docs.length * 2; tries++) {
                const randomIndex = Math.floor(Math.random() * docs.length);
                const candidateSnap = docs[randomIndex];

                // check by .id since snapshots are new objects each time
                const alreadyExists = arrPostsStack.some(snap => snap.id === candidateSnap.id);
                if (!alreadyExists) {
                arrPostsStack.push(candidateSnap);
                //console.log("Added new unique post:", candidateSnap.id);
                newSnap = candidateSnap;
                break;
                }
            }

            if (!newSnap) {
                //console.log("No unique post found (all already in stack).");
            }

            return newSnap;
        }


        
        if(document.querySelector(".group")){
            
            nextBtn.addEventListener("click", async(event) =>{

            
                if (currentPostIndex + 2 === arrPostsStack.length) {
                    await fetchUniquePost();
                }

                
                if(currentPostIndex + 1 < arrPostsStack.length){
                    currentPostIndex += 1;
                    console.log(currentPostIndex)
                    fillData();
                }
            })

            groups[2].addEventListener("click", async(e) =>{
                if (currentPostIndex + 2 === arrPostsStack.length) {
                    await fetchUniquePost();
                }

                
                if(currentPostIndex + 1 < arrPostsStack.length){
                    currentPostIndex += 1;
                    fillData();
                }
            })
            groups[0].addEventListener("click", async(e) =>{
                if (currentPostIndex - 1 < 0){
                    return;
                }
                currentPostIndex -= 1;  
                fillData();
            })


            prevbtn.addEventListener("click", async(event) => {
                if (currentPostIndex - 1 < 0){
                    return;
                }
                currentPostIndex -= 1;     
                fillData();
            })

            const joinButtons = [
                document.getElementById("joinBtn1"),
                document.getElementById("joinBtn2"),
                document.getElementById("joinBtn3"),
            ];

            joinButtons.forEach((btn, index) => {
                btn.addEventListener("click", async () => {
                    try {
                        let targetPostIndex;
                        
                        if (arrPostsStack.length === 1) {
                            if (index !== 1) return;
                            targetPostIndex = currentPostIndex;
                        } 
                        else if (arrPostsStack.length === 2) {
                            if (currentPostIndex === 0) {
                                if (index === 0) return;
                                if (index === 1) targetPostIndex = 0;
                                if (index === 2) targetPostIndex = 1;
                            } else {
                                if (index === 2) return;
                                if (index === 0) targetPostIndex = 0;
                                if (index === 1) targetPostIndex = 1;
                            }
                        } 
                        else if (currentPostIndex === 0 && arrPostsStack.length > 2) {
                            targetPostIndex = index;
                        } 
                        else if (currentPostIndex === arrPostsStack.length - 1) {
                            if (index === 0) targetPostIndex = currentPostIndex - 2;
                            else if (index === 1) targetPostIndex = currentPostIndex - 1;
                            else targetPostIndex = currentPostIndex;
                        } 
                        else {
                            if (index === 0) targetPostIndex = currentPostIndex - 1;
                            else if (index === 1) targetPostIndex = currentPostIndex;
                            else targetPostIndex = currentPostIndex + 1;
                        }

                        if (targetPostIndex < 0 || targetPostIndex >= arrPostsStack.length) {
                            console.warn("Invalid join click — no post in that direction.");
                            return;
                        }

                        const postSnap = arrPostsStack[targetPostIndex];
                        const postId = postSnap.id;
                        const postData = postSnap.data();

                        //SUDEEP did a unit test for getting chatId
                        const chatID = "chats" + postId.charAt(postId.length - 1);

                        const chatRef = doc(db, "chats", chatID);
                        const chatSnap = await getDoc(chatRef);
                        const chatData = chatSnap.data();

                        // Load user data
                        const userRef = doc(db, "users", user.uid);
                        const userSnap = await getDoc(userRef);
                        const userData = userSnap.data().ProfileData;

                        // Check if already a member
                        const alreadyMember = Object.values(postData)
                            .filter(v => v && typeof v === "object" && v.email)
                            .some(member => member.email === userData.userEmail);

                        if (alreadyMember) {
                            console.log("User already in group:", postId);
                            return;
                        }

                    //--> SUDEEP did a unit test for the following until the backwards arrow
                        // Determine group capacity
                        const maxSize = parseInt(postData.groupSizeMax, 10) || 1;
                        const currentMembers = Object.keys(postData).filter(key => key.startsWith("user")).length;

                        if (currentMembers >= maxSize) {
                            console.log("Group is full:", postId);
                            return;
                        }
                    //<--

                        // Find the next available user slot
                        let slot = null;
                        for (let i = 1; i <= maxSize; i++) {
                            const key = "user" + i;
                            if (!postData[key]) {
                                slot = key;
                                break;
                            }
                        }

                        if (!slot) {
                            console.log("No available slot in group:", postId);
                            return;
                        }

                        //SUDEEP did a unit test for userPayLoad
                        const userPayload = {
                            firstLastName: userData.firstName + " " + userData.lastName,
                            enrollStat: userData.enrollmentStatus,
                            pGrade: userData.grade,
                            pMajor: userData.major,
                            pAge: userData.age,
                            email: userData.userEmail
                        };

                        const memberKey = "members." + slot;
                        const memberValue = userData.firstName + " " + userData.lastName;

                        await updateDoc(doc(db, "posts", postId), { [slot]: userPayload });
                        await updateDoc(doc(db, "chats", chatID), {[memberKey]: memberValue});
                        await setDoc(doc(db, "users", user.uid), {userChats: {[chatID]: chatID}}, {merge: true});

                        // Refresh data
                        const freshSnap = await getDoc(doc(db, "posts", postId));
                        arrPostsStack[targetPostIndex] = freshSnap;
                        fillData();

                    } catch (error) {
                        console.error("Error joining group:", error);
                    }
                });
            });
        }

    });
});


document.getElementById("savePreferencesButton").addEventListener("click", async (event) => {
    event.preventDefault();

    // graab values from the form
    const groupSizeMin = document.getElementById("hgroupSizeMin").value || null;
    const groupSizeMax = document.getElementById("hgroupSizeMax").value || null;
    const groupLocation = document.getElementById("hgroupLocation").value || "";
    const groupAgeMin = document.getElementById("hgroupAgeMin").value || null;
    const groupAgeMax = document.getElementById("hgroupAgeMax").value || null;
    const groupTags = document.querySelector("#groupMatcherPreferencesTags .tagpicker-hidden").value.split(",").map(tag => tag.trim()).filter(Boolean);


    if (groupSizeMin !== null && (groupSizeMin < 2 || groupSizeMin > 5)) {
        alert("minimum group size must be between 2 and 5.");
        return;
    }

    if (groupSizeMax !== null && (groupSizeMax < 2 || groupSizeMax > 5)) {
        alert("maximum group size must be between 2 and 5.");
        return;
    }

    if (groupSizeMin !== null && groupSizeMax !== null && groupSizeMin > groupSizeMax) {
        alert("minimum group size must not be bigger than maximum group size");
        return;
    }

    if (groupAgeMin !== null && groupAgeMin < 18) {
        alert("minimum age for study group must be 18 or older");
        return;
    }

    if (groupAgeMax !== null && groupAgeMax < 18) {
        alert("maximum age for study group must be 18 or older");
        return;
    }

    if (!groupLocation) {
        alert("enter a group location");
        return;
    }

    // ensure user is logged in before saving any preferences (although unlikely may as well)
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to save preferences!");
        return;
    }

    // update the user in firebase
    try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            preferences: {
                groupSizeMin,
                groupSizeMax,
                groupLocation,
                groupAgeMin,
                groupAgeMax,
                groupTags
            }
        });
        alert("prefences saved");
        closeMenu('groupMatcherPreferences', 'close');
    } catch (error) {
        console.error("error saving preferences", error);
        alert("there was an error saving preferences, try again");
    }
});
