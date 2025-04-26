import React, { useState } from "react";

const JogWheel = ({ side = "left" }) => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleMouseDown = () => {
    setIsDragging(true);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      const centerX = e.currentTarget.offsetWidth / 2;
      const centerY = e.currentTarget.offsetHeight / 2;
      const mouseX = e.nativeEvent.offsetX;
      const mouseY = e.nativeEvent.offsetY;
      
      // Calculate angle
      const angle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
      setRotation(angle);
    }
  };
  
  // Color theme based on side (left/right for deck A/B)
  const accentColor = side === "left" ? "#4095e5" : "#e5405e";
  
  return (
    <div style={styles.jogWheelContainer}>
      <div 
        style={{
          ...styles.wheel,
          boxShadow: `0 0 10px 2px ${accentColor}30`,
          borderColor: accentColor,
          transform: `rotate(${rotation}deg)`
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div style={styles.center}>
          <div style={{...styles.centerDot, backgroundColor: accentColor}}></div>
        </div>
        <div style={styles.grooves}></div>
      </div>
      <div style={styles.jogLabel}>JOG</div>
    </div>
  );
};

const styles = {
  jogWheelContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  wheel: {
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    backgroundColor: "#2a2a2a",
    border: "4px solid #4095e5",
    boxShadow: "0 0 10px 2px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.6)",
    position: "relative",
    cursor: "pointer",
    transition: "box-shadow 0.3s ease",
    overflow: "hidden",
  },
  center: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "40%",
    height: "40%",
    borderRadius: "50%",
    backgroundColor: "#1a1a1a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "inset 0 0 10px rgba(0,0,0,0.8)",
  },
  centerDot: {
    width: "30%",
    height: "30%",
    borderRadius: "50%",
    backgroundColor: "#4095e5",
  },
  grooves: {
    position: "absolute",
    top: "10%",
    left: "10%",
    width: "80%",
    height: "80%",
    borderRadius: "50%",
    boxShadow: "inset 0 0 15px rgba(255,255,255,0.1)",
    backgroundImage: "repeating-radial-gradient(circle at center, transparent, transparent 5px, rgba(255,255,255,0.03) 5px, rgba(255,255,255,0.03) 6px)",
  },
  jogLabel: {
    marginTop: "8px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#888",
    letterSpacing: "1px",
  }
};

export default JogWheel;