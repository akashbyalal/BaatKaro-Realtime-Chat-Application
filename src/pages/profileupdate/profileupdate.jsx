import React, { useContext, useEffect, useState } from "react";
import "./profileupdate.css";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import upload from "../../lib/upload";
import { AppContext } from "../../context/AppContext";

const Profileupdate = () => {
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState(null);

  const { setUserdata } = useContext(AppContext);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      setUid(user.uid);

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setBio(data.bio || "");
        setPrevImage(data.avatar || null);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (image) {
      const objectUrl = URL.createObjectURL(image);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    if (prevImage) {
      setPreview(prevImage);
    } else {
      setPreview(assets.avatar_icon);
    }
  }, [image, prevImage]);

  const profileUpdate = async (e) => {
    e.preventDefault();

    try {
      if (!uid) {
        toast.error("User not ready");
        return;
      }

      if (!prevImage && !image) {
        toast.error("Upload Profile Picture");
        return;
      }

      const docRef = doc(db, "users", uid);

      let imgUrl = prevImage;

      if (image) {
        imgUrl = await upload(image);

        if (!imgUrl) {
          toast.error("Upload failed");
          return;
        }
      }

      await setDoc(
        docRef,
        {
          avatar: imgUrl,
          name: name,
          bio: bio,
          lastSeen: Date.now(),
        },
        { merge: true },
      );

      setUserdata({
        avatar: imgUrl,
        name,
        bio,
      });

      navigate("/chat");
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something failed");
    }
  };

  return (
    <div className="updateprofile">
      <div className="profile-containers">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>

          <label htmlFor="avatar">
            <input
              type="file"
              id="avatar"
              accept=".jpg, .jpeg, .png"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
            {preview && <img className="profile-pic" src={preview} alt="" />}
            Upload Profile Image
          </label>

          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <textarea
            placeholder="Write your Profile Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
          />

          <button type="submit">Save</button>
        </form>

        <img className="logo profile-pic" src={assets.Logo} alt="" />
      </div>
    </div>
  );
};

export default Profileupdate;
