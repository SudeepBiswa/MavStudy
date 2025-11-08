import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  doc, getDoc, collection, serverTimestamp, query, orderBy, onSnapshot, addDoc, setDoc, updateDoc, deleteField, FieldPath
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

window.addEventListener("DOMContentLoaded", () => {
  const groupNameTemplate = document.getElementById("groupNameTemp");
  const recieveMsgTemp = document.getElementById("recievedMsgTemp");
  const sentMsgTemp = document.getElementById("sentMsgTemp");
  const gList = document.getElementById("gList");
  const mList = document.getElementById("mList");
  //const activeList = document.getElementById("activeG");
  const msgInput = document.getElementById("messageBar");
  const sendBtn = document.getElementById("sendMsg");

  const leaveBtn = document.getElementById("leaveBtn");


  let currentUnsub = null;
  let selectedChat = null;
  let userData = null;
  const rowById = new Map();

  // helper to show "Chat not selected" message
  function showNoChatSelected() {
    const headers = document.querySelectorAll(".groupInfo");
    const headersActions = document.querySelectorAll(".groupActions");
    headers[0].style.display = "none";
    headersActions[0].style.display = "none";
    mList.innerHTML = `
      <div id="noChatSelected"
           style="display:flex;
                  align-items:center;
                  justify-content:center;
                  height:100%;
                  font-size:1.3rem;
                  color:#777;">
        Chat not selected
      </div>`;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // start with "Chat not selected"
    showNoChatSelected();

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userDoc = userSnap.data() || {};
    userData = userDoc.ProfileData || {};
    const userChats = userDoc.userChats || {};

    // render chats
    const entries = Object.entries(userChats);
    if (entries.length) {
      const frag = document.createDocumentFragment();
      const chatRefs = entries.map(([, chatId]) => doc(db, "chats", chatId));
      const snaps = await Promise.all(chatRefs.map((r) => getDoc(r)));

      snaps.forEach((snap, i) => {
        if (!snap.exists()) return;
        const chatId = entries[i][1];
        const chatData = snap.data();
        const clone = groupNameTemplate.content.cloneNode(true);
        const root = clone.querySelector(".groupsListActiveGroup");
        root.id = chatId;
        const h1 = root.querySelector("h1");
        if (h1) h1.textContent = chatData?.chatName ?? "Unnamed Chat";
        frag.appendChild(clone);
      });

      gList.textContent = "";
      gList.appendChild(frag);
    }

    // event delegation
    gList.addEventListener("click", (e) => {
      const item = e.target.closest(".groupsListActiveGroup");
      if (!item || !gList.contains(item)) return;

      if (item.id === selectedChat) {
        // Deselect if the same chat clicked again
        selectedChat = null;
        if (currentUnsub) currentUnsub();
        currentUnsub = null;
        rowById.clear();
        showNoChatSelected();
        return;
      }

      openChat(item.id);
    });

    sendBtn.addEventListener("click", async () => {
      if (!selectedChat) return;
      const val = msgInput.value.trim();
      if (!val) return;

      sendBtn.disabled = true;
      try {
        const messagesCol = collection(db, "chats", selectedChat, "messages");
        await addDoc(messagesCol, {
          creationDate: serverTimestamp(),
          sender: `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim(),
          senderEmail: userData.userEmail,
          message: val
        });
        msgInput.value = "";
      } finally {
        sendBtn.disabled = false;
      }
    });

    const leaveBtn = document.getElementById("leaveBtn");
  leaveBtn.addEventListener("click", async () => {
    if (!selectedChat) return;

    // Remove chat from user's userChats
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userDoc = userSnap.data();
    const userChats = userDoc.userChats || {};
    const chatKey = Object.keys(userChats).find(key => userChats[key] === selectedChat);

    if (chatKey) {
      delete userChats[chatKey];
      await setDoc(userRef, { userChats }, { merge: true });
    }

    // Remove user from post document
    const postID = "posts" + selectedChat.charAt(selectedChat.length - 1);
    const postRef = doc(db, "posts", postID);
    const postSnap = await getDoc(postRef);
    const postData = postSnap.data();
    const userEmail = user.email;

    let fieldToDelete = null;
    for (const [key, value] of Object.entries(postData)) {
      if (key.startsWith("user") && value.email === userEmail) {
        fieldToDelete = key;
        break;
      }
    }
    if (fieldToDelete) {
      await updateDoc(postRef, {
        [fieldToDelete]: deleteField()
      });
    }

      // Remove user from chat members
      const chatRef = doc(db, "chats", selectedChat);
      const chatSnap = await getDoc(chatRef);
      const chatData = chatSnap.data();
      const members = chatData.members || {};
      const currentName = userData.firstName + " " + userData.lastName;

      for (const key in members) {
        if (members[key] === currentName) {
          await updateDoc(chatRef, {
            ["members." + key]: deleteField()
          });
          break; // stop after removing current user
        }
      }
    
    if (currentUnsub) {
      currentUnsub();        // stop the messages snapshot listener
      currentUnsub = null;
    } 
    selectedChat = null;
    rowById.clear(); 
    showNoChatSelected();
  })

  async function openChat(chatId) {
    // Tear down old listener
    if (currentUnsub) {
      currentUnsub();
      currentUnsub = null;
    }

    selectedChat = chatId;
    mList.textContent = "";
    rowById.clear();

    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
      showNoChatSelected();
      console.warn("Chat not found:", chatId);
      return;
    }

    const messagesCol = collection(db, "chats", chatId, "messages");
    const q = query(messagesCol, orderBy("creationDate", "asc"));

    const headers = document.querySelectorAll(".groupInfo");
    const headersActions = document.querySelectorAll(".groupActions");
    headers[0].style.display = "flex";
    headersActions[0].style.display = "flex";
    const postID = "posts" + chatId.charAt(chatId.length - 1);
    const postRef = await getDoc(doc(db, "posts", postID));
    const postData = postRef.data();
    console.log(postRef.data())
    const infoHeader = document.querySelectorAll(".groupInfo h1");
    infoHeader[0].textContent = postData.user1?.firstLastName || "Unkown";
    infoHeader[2].textContent = postData?.groupLocation;

    currentUnsub = onSnapshot(q, (snapshot) => {
      const addsFrag = document.createDocumentFragment();

      snapshot.docChanges().forEach((change) => {
        const id = change.doc.id;
        const msg = change.doc.data();

        if (change.type === "added") {
          if (rowById.has(id)) return;

          const clone = (userData?.userEmail === msg.senderEmail)
            ? sentMsgTemp.content.cloneNode(true)
            : recieveMsgTemp.content.cloneNode(true);

          const root = clone.firstElementChild || clone;
          const headers = root.querySelectorAll(".messageContent h1");
          if (headers[0]) headers[0].textContent = msg.sender ?? "";
          if (headers[1]) headers[1].textContent = msg.message ?? "";
          if (headers[2]) {
            const ts = msg.creationDate;
            headers[2].textContent =
              ts && typeof ts.toDate === "function"
                ? ts.toDate().toLocaleString()
                : "";
          }

          root.dataset.id = id;
          rowById.set(id, root);
          addsFrag.appendChild(root);

        } else if (change.type === "modified") {
          const node = rowById.get(id);
          if (!node) return;
          const headers = node.querySelectorAll(".messageContent h1");
          if (headers[0]) headers[0].textContent = msg.sender ?? "";
          if (headers[1]) headers[1].textContent = msg.message ?? "";
          if (headers[2]) {
            const ts = msg.creationDate;
            if (ts && typeof ts.toDate === "function") {
              headers[2].textContent = ts.toDate().toLocaleString();
            }
          }

        } else if (change.type === "removed") {
          const node = rowById.get(id);
          if (node) {
            node.remove();
            rowById.delete(id);
          }
        }
      });

      if (addsFrag.childNodes.length) {
        mList.appendChild(addsFrag);
        requestAnimationFrame(() => {
          mList.scrollTop = mList.scrollHeight;
        });
      }
    });
  }
});});
