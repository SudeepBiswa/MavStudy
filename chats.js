import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, setDoc, updateDoc, getDoc, runTransaction, getDocs, collection, serverTimestamp, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

window.addEventListener("DOMContentLoaded", () =>{
    // if user is NOT authenticated redirect to login page
    const groupNameTemplate = document.getElementById("groupNameTemp")
    const recieveMsgTemp = document.getElementById("recievedMsgTemp");
    const sentMsgTemp = document.getElementById("sentMsgTemp");
    const gList = document.getElementById("gList");
    const mList = document.getElementById("mList");
    const msgPlaceholder = document.getElementById("messageBar");
    onAuthStateChanged(auth, async(user) => {
        
        //console.log(user)
        if (!user) {
                window.location.href = "login.html";
            return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data().ProfileData;
        const chats = userSnap.data().userChats;

        //let listOfChats = [];

        //console.log(chats)

        const entries = Object.entries(chats);

        for (const [key, chat] of entries) {
            const chatRef = doc(db, "chats", chat);
            const chatSnap = await getDoc(chatRef);
            if (!chatSnap.exists()) continue;

            const chatData = chatSnap.data();
            const clone = groupNameTemplate.content.cloneNode(true);
            clone.querySelector(".groupsListActiveGroup").id = chat;
            clone.querySelector(".groupsListActiveGroup h1").textContent = chatData?.chatName ?? "Unnamed Chat";

            gList.appendChild(clone);
        }

        const chatDivs = gList.querySelectorAll(".groupsListActiveGroup");
        console.log(chatDivs);

        let selectedChat = null;

        chatDivs.forEach(el =>{
            el.addEventListener("click", () =>{
                //console.log("test: " + el.id)
                selectedChat = el.id;
                fillChat();
            })
        })

        async function fillChat(){
            if (!selectedChat) return;
                const chatRef = doc(db, "chats", selectedChat);
                const chatSnap = await getDoc(chatRef);

            if (!chatSnap.exists()) {
                console.warn("Chat not found:", selectedChat);
                return;
            }

            

            const chatData = chatSnap.data()
            const messagesCollection = collection(db, "chats", selectedChat, "messages");
            console.log("Loaded chat:", messagesCollection);

            const q = query(messagesCollection, orderBy("creationDate", "asc"));
            const snap = await getDocs(q);
            const messages = snap.docs.map(d=>({id: d.id,...d.data()}));

            console.log(messages);
            messages.forEach(msg => {
                if(userData.userEmail == msg.senderEmail){
                    const clone = sentMsgTemp.content.cloneNode(true);
                    const headers =  clone.querySelectorAll(".messageContent h1");
                    headers[0].textContent = msg.sender;
                    headers[1].textContent = msg.message;
                    headers[2].textContent = msg.creationDate.toDate().toLocaleString();
                    mList.appendChild(clone);
                }else{
                    const clone = recieveMsgTemp.content.cloneNode(true);
                    const headers =  clone.querySelectorAll(".messageContent h1");
                    headers[0].textContent = msg.sender;
                    headers[1].textContent = msg.message;
                    //headers[2].textContent = msg.creationDate.toDate()
                    mList.appendChild(clone);
                }
            })

        }


    });
});