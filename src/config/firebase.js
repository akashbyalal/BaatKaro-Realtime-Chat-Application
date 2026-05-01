import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyAgpLh6BLIiXjGRJENNboHBwLkcBF4qqY0",
  authDomain: "baatkaro-fcc67.firebaseapp.com",
  projectId: "baatkaro-fcc67",
  storageBucket: "baatkaro-fcc67.firebasestorage.app",
  messagingSenderId: "845591700534",
  appId: "1:845591700534:web:8d19db5af67ae255a02497"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Koi baat karo yarr",
      lastSeen: Date.now()
    });

    await setDoc(doc(db, "chats", user.uid), {
      chatData: []
    });

    toast.success("Account created");
  } catch (error) {
    console.error(error);
    toast.error(error.code.split('/')[1].split('-').join(' '));
    
  }
};

const login = async(email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Login successful");
    } catch(error){
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(' '));
    }
}

const logout = async() =>{
    try{
        signOut(auth)
    } catch(error) {
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(' '));
    }
}

export { signup, login, logout, auth, db};