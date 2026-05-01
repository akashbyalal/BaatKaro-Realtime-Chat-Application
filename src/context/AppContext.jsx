import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { db } from "../config/firebase";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [userdata, setUserdata] = useState(null);
  const [chatdata, setChatdata] = useState([]);
  const [messageId, setMessageId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatuser, setChatuser] = useState(null);

  const loadUserData = async (uid) => {
    try {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, { id: uid }, { merge: true });
        setUserdata({ id: uid });
        return;
      }

      setUserdata({
        id: uid,
        ...snap.data(),
      });
    } catch (err) {
      console.error("loadUserData error:", err);
    }
  };

  useEffect(() => {
    if (!userdata || !userdata.id) return;

    let isMounted = true;

    const chatRef = doc(db, "chats", userdata.id);

    const unSub = onSnapshot(chatRef, async (res) => {
      try {
        const data = res.data();

        if (!data || !data.chatdata) {
          if (isMounted) setChatdata([]);
          return;
        }

        const temp = [];

        for (const item of data.chatdata) {
          try {
            const userRef = doc(db, "users", item.rId);
            const userSnap = await getDoc(userRef);

            temp.push({
              ...item,
              userData: userSnap.exists() ? userSnap.data() : null,
            });
          } catch (err) {
            console.error(err);
          }
        }

        if (isMounted) {
          setChatdata(
            temp.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
          );
        }
      } catch (err) {
        console.error(err);
      }
    });

    return () => {
      isMounted = false;
      unSub();
    };
  }, [userdata]);

  return (
    <AppContext.Provider
      value={{
        userdata,
        setUserdata,
        chatdata,
        setChatdata,
        loadUserData,
        messageId,
        setMessageId,
        messages,
        setMessages,
        chatuser,
        setChatuser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;