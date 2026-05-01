import React, { useState, useContext, useEffect, useRef } from "react";
import assets from "../../assets/assets";
import "./middle.css";
import { AppContext } from "../../context/AppContext";
import {
  onSnapshot,
  doc,
  arrayUnion,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";
import upload from "../../lib/upload";

const Middle = () => {
  const { chatuser, messageId, setMessages, userdata, messages } =
    useContext(AppContext);

  const [input, setInput] = useState("");
  const endRef = useRef(null);

  // 🔥 SEND MESSAGE (text + image)
  const sendMessage = async (file = null) => {
    try {
      if (!messageId || !chatuser?.rId || !userdata?.id) return;

      let payload = null;

      // IMAGE
      if (file) {
        const url = await upload(file);

        if (!url) {
          toast.error("Image upload failed");
          return;
        }

        payload = {
          sId: userdata.id,
          text: url,
          type: "image",
          createdAt: Date.now(),
        };
      }

      // TEXT
      else if (input.trim()) {
        payload = {
          sId: userdata.id,
          text: input,
          type: "text",
          createdAt: Date.now(),
        };
      }

      if (!payload) return;

      const msgRef = doc(db, "messages", messageId);
      const snap = await getDoc(msgRef);

      if (!snap.exists()) {
        await setDoc(msgRef, { messages: [payload] });
      } else {
        await updateDoc(msgRef, {
          messages: arrayUnion(payload),
        });
      }

      // update chat preview
      const userIds = [chatuser.rId, userdata.id];

      for (const id of userIds) {
        const ref = doc(db, "chats", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) continue;

        const data = snap.data();
        const chats = data.chatdata || [];

        const index = chats.findIndex((c) => c.messageId === messageId);
        if (index === -1) continue;

        const updated = [...chats];

        updated[index] = {
          ...updated[index],
          lastMessage:
            payload.type === "image"
              ? "📷 Image"
              : payload.text.slice(0, 30),
          updatedAt: Date.now(),
          messageSeen: id === userdata.id,
        };

        await updateDoc(ref, { chatdata: updated });
      }

      setInput("");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // 🔥 FETCH MESSAGES
  useEffect(() => {
    if (!messageId) return;

    const unSub = onSnapshot(doc(db, "messages", messageId), (res) => {
      const data = res.data();
      setMessages(data?.messages || []);
    });

    return () => unSub();
  }, [messageId]);

  // 🔥 AUTO SCROLL
  useEffect(() => {
    endRef.current?.scrollIntoView();
  }, [messages]);

  return chatuser ? (
    <div className="chatbox">
      <div className="chat-user">
        <img src={chatuser.userData?.avatar} alt="" />
        <p>{chatuser.userData?.name}</p>
      </div>

      <div className="chat-msg">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.sId === userdata.id ? "s-msg" : "r-msg"}
          >
            {msg.type === "image" && msg.text ? (
              <img className="msg-img" src={msg.text} alt="" />
            ) : (
              <p className="msg">{msg.text}</p>
            )}

            <div>
              <img
                src={
                  msg.sId === userdata.id
                    ? userdata.avatar
                    : chatuser.userData?.avatar
                }
                alt=""
              />

              <p>
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        <div ref={endRef}></div>
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Send a message"
        />

        {/* 🔥 FIXED IMAGE SEND */}
        <input
          type="file"
          id="image"
          accept="image/png, image/jpeg, image/jpg"
          hidden
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              sendMessage(file); // send immediately
              e.target.value = "";
            }
          }}
        />

        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>

        <img onClick={() => sendMessage()} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className="chat-welcome">
      <img src={assets.Llogo} alt="" />
    </div>
  );
};

export default Middle;