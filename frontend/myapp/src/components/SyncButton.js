import React, { useState } from "react";

const SyncButton = () => {
  const [active, setActive] = useState(false);
  
  const handleClick = () => {
    setActive(!active);
  };
  
  return (
    <div style={styles.container}>
      <button 
        style={{
          ...styles.button,
          backgroundColor: active ? "#00c6ff" : "#1a1a1a",
          boxShadow: active ? "0 0 15px #00c6ff90" : "none",
        }}
        onClick={handleClick}
      >
        SYNC
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "10px 0",
  },
  button: {
    backgroundColor: "#1a1a1a",
    color: "white",
    borderRadius: "4px",
    padding: "8px 16px",
    border: "1px solid #333",
    cursor: "pointer",
    fontWeight: "bold",
    letterSpacing: "1px",
    transition: "all 0.2s ease",
    minWidth: "80px",
    textAlign: "center",
    fontSize: "14px",
    fontFamily: "'Rajdhani', sans-serif",
  },
};

export default SyncButton;