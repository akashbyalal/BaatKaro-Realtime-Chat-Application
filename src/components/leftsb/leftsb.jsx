import React, { useContext, useRef, useState, useEffect } from "react";
import "./leftsb.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  collection,
  getDocs,
  serverTimestamp,
  arrayUnion,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import bkl from "../../assets/bkl.mp3";

const Leftsb = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showModi, setShowModi] = useState(true);

  const navigate = useNavigate();
  const { userdata, chatdata, setChatuser, setMessageId } =
    useContext(AppContext);

  const audioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(bkl);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleModiClick = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

    audio.play().catch(() => {});

    setShowModi(false);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setShowModi(true);
    }, 600000); // 10 min
  };

  const inputHandler = async (e) => {
  try {
    const input = e.target.value.trim().toLowerCase();

    if (!input) {
      setUser(null);
      setShowSearch(false);
      return;
    }

    const snap = await getDocs(collection(db, "users"));

    let found = null;

    for (const docSnap of snap.docs) {
      const u = docSnap.data();

      // 🔥 HARD GUARDS (no assumptions)
      if (!u) continue;
      if (!u.id) continue;
      if (typeof u.username !== "string") continue;

      const username = u.username.toLowerCase();

      if (username.includes(input)) {
        found = u;
        break;
      }
    }

    if (!found || found.id === userdata?.id) {
      setUser(null);
      setShowSearch(false);
      return;
    }

    const exists = chatdata?.some((c) => c.rId === found.id);

    if (exists) {
      setUser(null);
      setShowSearch(false);
      return;
    }

    setUser(found);
    setShowSearch(true);

  } catch (err) {
    console.error("Search error:", err);
  }
};

  const addChat = async () => {
    try {
      if (!user || !userdata) return;

      const chatDocRef = doc(db, "chats", userdata.id);
      const snap = await getDoc(chatDocRef);
      const existing = snap.exists() ? snap.data().chatdata || [] : [];

      const alreadyExists = existing.some((item) => item.rId === user.id);

      if (alreadyExists) {
        toast.info("Chat already exists");
        setShowSearch(false);
        setUser(null);
        return;
      }

      const messageRef = doc(collection(db, "messages"));

      await setDoc(messageRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const payload = {
        messageId: messageRef.id,
        lastMessage: "",
        updatedAt: Date.now(),
        messageSeen: true,
      };

      await setDoc(
        doc(db, "chats", userdata.id),
        {
          chatdata: arrayUnion({
            ...payload,
            rId: user.id,
          }),
        },
        { merge: true },
      );

      await setDoc(
        doc(db, "chats", user.id),
        {
          chatdata: arrayUnion({
            ...payload,
            rId: userdata.id,
          }),
        },
        { merge: true },
      );

      setShowSearch(false);
      setUser(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const setChat = (item) => {
    setMessageId(item.messageId);
    setChatuser(item);
  };

  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-nav">
          <img className="Logo" src={assets.CLogo} alt="" />

          <div className="menu">
            <img
              onClick={() => setShowMenu(!showMenu)}
              src={assets.menu_icon}
              alt=""
            />

            <div className={`sub-menu ${showMenu ? "active" : ""}`}>
              <p onClick={() => navigate("/updateprofile")}>Edit Profile</p>
              <hr />
              <p
                onClick={() => {
                  navigate("/");
                  toast.success("Logged out successfully");
                }}
              >
                Logout
              </p>
            </div>
          </div>
        </div>

        <div className="ls-search">
          <input
            type="text"
            placeholder="Search here..."
            onChange={inputHandler}
          />
          <img src={assets.search_icon} alt="" />
        </div>
      </div>

      <div className="ls-list">
        {!showSearch && showModi && (
          <div onClick={handleModiClick} className="frnds pinned">
            <img src={assets.Modi} alt="" />
            <div>
              <p>Modi Bhai</p>
              <span>Ache din Ayenge..</span>
            </div>
          </div>
        )}

        {showSearch && user && (
          <div onClick={addChat} className="frnds adduser">
            <img src={user.avatar || assets.avatar_icon} alt="" />
            <p>{user.name}</p>
          </div>
        )}

        {!showSearch &&
          chatdata?.map((item, index) => (
            <div onClick={() => setChat(item)} key={index} className="frnds">
              <img src={item.userData?.avatar || assets.avatar_icon} alt="" />
              <div>
                <p>{item.userData?.name || "User"}</p>
                <span>{item.lastMessage || "Say hi 👋"}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Leftsb;
