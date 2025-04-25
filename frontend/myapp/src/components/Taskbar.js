import React from "react";
import "./Taskbar.css"; // Import CSS

const Taskbar = () => {
  return (
    <div className="taskbar">
      {/* Left Side: Logo + Title */}
      <div className="taskbar-left">
        <div className="app-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 4L7 9V20H17V9L12 4Z" fill="#FF5500" />
            <path d="M12 4L7 9H17L12 4Z" fill="#FF8800" />
            <path d="M10 13V17M14 11V15" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <span className="taskbar-title">FLUX DJ</span>
      </div>

      {/* Right Side: Menu Items */}
      <ul className="taskbar-right">
        <li className="menu-item">Library</li>
        <li className="menu-item">Mix</li>
        <li className="menu-item">FX</li>
        <li className="menu-item">Settings</li>
        <li>
          <button className="signin-btn">SIGN IN</button>
        </li>
      </ul>
    </div>
  );
};

export default Taskbar;