import React, { useState, useRef, useEffect } from "react";

const Knob = ({
  label,
  min = -12,
  max = 12,
  defaultValue = 0,
  color = "#4095e5",
  onChange,
}) => {
  const [value, setValue] = useState(defaultValue);
  const knobRef = useRef(null);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  // Convert value to rotation angle (-135deg to 135deg)
  const rotation = ((value - min) / (max - min)) * 270 - 135;

  const handleMouseDown = (e) => {
    startYRef.current = e.clientY;
    startValueRef.current = value;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    const deltaY = startYRef.current - e.clientY;
    const deltaValue = (deltaY / 100) * (max - min);
    const newValue = Math.max(
      min,
      Math.min(max, startValueRef.current + deltaValue)
    );
    const roundedValue = Math.round(newValue * 2) / 2; // Round to nearest 0.5

    setValue(roundedValue);
    if (onChange) onChange(roundedValue);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div style={styles.knobContainer}>
      <div ref={knobRef} style={styles.knobOuter} onMouseDown={handleMouseDown}>
        <div
          style={{
            ...styles.knob,
            transform: `rotate(${rotation}deg)`,
            backgroundColor: "#222",
            boxShadow: `0 0 10px ${color}40`,
          }}
        >
          <div style={styles.knobInner}>
            <div style={{ ...styles.indicator, backgroundColor: color }}></div>
          </div>
        </div>
        <div style={styles.knobRing}></div>
      </div>
      <div style={styles.labelContainer}>
        <div style={{ ...styles.valueDisplay, color }}>
          {value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)}
        </div>
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
    cursor: "grab",
  },
  knobRing: {
    position: "absolute",
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    border: "2px solid #333",
    boxShadow: "0 0 5px rgba(0,0,0,0.5)",
    backgroundImage:
      "repeating-conic-gradient(from 0deg, #333 0deg 30deg, #222 30deg 60deg)",
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
    transition: "transform 0.05s ease-out", // Smoother but still responsive rotation
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
  valueDisplay: {
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "2px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#aaa",
    letterSpacing: "1px",
  },
};

export default Knob;
