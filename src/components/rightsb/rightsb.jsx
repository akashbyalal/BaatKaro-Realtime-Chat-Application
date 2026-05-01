import React, { useContext } from "react";
import "./rightsb.css";
import assets from "../../assets/assets";
import { logout } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";

const Rightsb = () => {
  const { chatuser, userdata, messages } = useContext(AppContext);

  // 🔥 decide which user to show
  const user = chatuser?.userData || userdata;

  // 🔥 show only image messages when chat is selected
  const imageMessages = chatuser
    ? messages?.filter((msg) => msg.type === "image").slice(-10)
    : [];

  return (
    <div className="rs">
      <div className="rs-profile">
        <img
          className="profile"
          src={user?.avatar || assets.avatar_icon}
          alt=""
        />

        <h3>
          {user?.name || "User"}
          <img className="dot" src={assets.green_dot} alt="" />
        </h3>

        <p>{user?.bio || "No bio"}</p>

        <hr />

        <div className="rs-media">
          <p>Media</p>

          <div>
            {chatuser && imageMessages.length > 0 ? (
              imageMessages.map((msg, i) => (
                <img key={i} src={msg.text} alt="" />
              ))
            ) : (
              <p style={{ fontSize: "12px" }}>
                {chatuser ? "No media yet" : "Select a chat to see media"}
              </p>
            )}
          </div>

          <button onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Rightsb;