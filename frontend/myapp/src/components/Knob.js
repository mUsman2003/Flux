import React, { useState } from "react";

const Knob = ({ label, min = 0, max = 100, defaultValue = 50, color = "#4095e5" }) => {
  const [value, setValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(defaultValue);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaY = startY - e.clientY;
      const deltaValue = deltaY * 0.5;
      const newValue = Math.max(min, Math.min(max, startValue + deltaValue));
      setValue(newValue);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Calculate rotation based on value
  const rotation = ((value - min) / (max - min)) * 270 - 135;

  return (
    <div style={styles.knobContainer}>
      <div 
        style={styles.knobOuter}
        onMouseDown={handleMouseDown}
      >
        <div 
          style={{
            ...styles.knob,
            transform: `rotate(${rotation}deg)`,
            backgroundColor: "#222",
            boxShadow: `0 0 10px ${color}40`
          }}
        >
          <div style={styles.knobInner}>
            <div style={{...styles.indicator, backgroundColor: color}}></div>
          </div>
        </div>
        <div style={styles.knobRing}></div>
      </div>
      <div style={styles.labelContainer}>
        <div style={{...styles.valueIndicator, backgroundColor: color}}></div>
        <span style={styles.label}>{label}</span>
      </div>
    </div>
  );
};

const styles = {
  knobContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "5px 10px",
    position: "relative",
  },
  knobOuter: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    cursor: "pointer",
  },
  knobRing: {
    position: "absolute",
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    border: "2px solid #333",
    boxShadow: "0 0 5px rgba(0,0,0,0.5)",
    backgroundImage: "repeating-conic-gradient(from 0deg, #333 0deg 30deg, #222 30deg 60deg)",
  },
  knob: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(145deg, #2d2d2d, #242424)",
    boxShadow: "5px 5px 10px #1a1a1a, -5px -5px 10px #343434",
    position: "relative",
    zIndex: 2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transform: "rotate(-135deg)",
  },
  knobInner: {
    width: "85%",
    height: "85%",
    borderRadius: "50%",
    background: "linear-gradient(145deg, #242424, #1a1a1a)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    width: "4px",
    height: "40%",
    backgroundColor: "#4095e5",
    borderRadius: "4px",
    transformOrigin: "bottom",
    transform: "translateY(-30%)",
  },
  labelContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "4px",
  },
  valueIndicator: {
    width: "10px",
    height: "3px",
    backgroundColor: "#4095e5",
    marginBottom: "3px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#aaa",
    letterSpacing: "1px",
  }
};

export default Knob;