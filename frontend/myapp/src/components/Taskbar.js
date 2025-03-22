import React from "react";
import "./Taskbar.css"; // Import CSS

const Taskbar = () => {
  return (
    <div className="taskbar">
      {/* Left Side: Profile Icon + Title */}
      <div className="taskbar-left">
        <div className="profile-icon">D</div>
        <span className="taskbar-title">FLUX</span>
      </div>

      {/* Right Side: List Items + Sign In Button */}
      <ul className="taskbar-right">
        <li>Help</li>
        <li>Settings</li>
        <li>
          <button className="signin-btn">Sign In</button>
        </li>
      </ul>
    </div>
  );
};

export default Taskbar;
