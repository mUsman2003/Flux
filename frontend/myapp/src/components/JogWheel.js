import React, { useState, useEffect, useRef } from "react";

const JogWheel = ({
  audioRef,
  side = "left",
  scratchSensitivity = 0.1,
  seekSensitivity = 0.5,
}) => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [mode, setMode] = useState("seek"); // "seek" or "scratch"

  const lastX = useRef(0);
  const lastY = useRef(0);
  const rotationSpeed = useRef(0);
  const wasPlaying = useRef(false);
  const animationRef = useRef(null);

  // Color theme based on side (left/right for deck A/B)
  const accentColor = side === "left" ? "#4095e5" : "#e5405e";

  // Handle scratch effect
  useEffect(() => {
    if (!audioRef?.current) return;

    const applyScratchEffect = () => {
      if (isScratching && audioRef.current) {
        // Apply rotation speed to audio scrubbing
        if (mode === "scratch") {
          // Adjust current time based on rotation speed
          audioRef.current.currentTime +=
            rotationSpeed.current * scratchSensitivity;
        }
        animationRef.current = requestAnimationFrame(applyScratchEffect);
      }
    };

    if (isScratching) {
      animationRef.current = requestAnimationFrame(applyScratchEffect);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isScratching, audioRef, scratchSensitivity, mode]);

  const handleMouseDown = (e) => {
    if (!audioRef?.current) return;

    setIsDragging(true);
    lastX.current = e.nativeEvent.offsetX;
    lastY.current = e.nativeEvent.offsetY;

    // If in scratch mode, pause playback and remember state
    if (mode === "scratch") {
      wasPlaying.current = !audioRef.current.paused;
      setIsScratching(true);
      if (wasPlaying.current) {
        audioRef.current.pause();
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    // If we were scratching, restore playback state
    if (isScratching && audioRef?.current) {
      setIsScratching(false);
      rotationSpeed.current = 0;
      if (wasPlaying.current) {
        audioRef.current
          .play()
          .catch((e) => console.error("Error resuming playback:", e));
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !audioRef?.current) return;

    const centerX = e.currentTarget.offsetWidth / 2;
    const centerY = e.currentTarget.offsetHeight / 2;
    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;

    // Calculate angle
    const angle =
      Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
    setRotation(angle);

    // Calculate delta movement for scrubbing
    const deltaX = mouseX - lastX.current;
    const deltaY = mouseY - lastY.current;

    // Calculate rotation speed/direction based on movement from center
    const vectorX = mouseX - centerX;
    const vectorY = mouseY - centerY;
    const crossProduct = deltaX * vectorY - deltaY * vectorX;
    rotationSpeed.current = crossProduct / 5000; // Scale down for better control

    // Apply jog effect based on mode
    if (mode === "seek" && !isScratching) {
      // In seek mode, adjust when dragging but not scratching
      audioRef.current.currentTime += rotationSpeed.current * seekSensitivity;
    }

    lastX.current = mouseX;
    lastY.current = mouseY;
  };

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "seek" ? "scratch" : "seek"));
  };

  return (
    <div style={styles.jogWheelContainer}>
      <div
        style={{
          ...styles.wheel,
          boxShadow: `0 0 10px 2px ${accentColor}30`,
          borderColor: accentColor,
          transform: `rotate(${rotation}deg)`,
          backgroundColor: isScratching ? "#3a3a3a" : "#2a2a2a",
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div style={styles.center}>
          <div
            style={{
              ...styles.centerDot,
              backgroundColor: accentColor,
              boxShadow: isScratching
                ? `0 0 10px 2px ${accentColor}80`
                : "none",
            }}
          ></div>
        </div>
        <div style={styles.grooves}></div>
      </div>
      <div style={styles.controlRow}>
        <div style={styles.jogLabel}>{isDragging ? "ACTIVE" : "JOG"}</div>
        <button
          style={{
            ...styles.modeButton,
            backgroundColor: mode === "scratch" ? accentColor : "#333",
            color: mode === "scratch" ? "#000" : "#fff",
          }}
          onClick={toggleMode}
        >
          {mode === "scratch" ? "SCRATCH" : "SEEK"}
        </button>
      </div>
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
    transition: "background-color 0.2s ease, box-shadow 0.3s ease",
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
    transition: "box-shadow 0.2s ease",
  },
  grooves: {
    position: "absolute",
    top: "10%",
    left: "10%",
    width: "80%",
    height: "80%",
    borderRadius: "50%",
    boxShadow: "inset 0 0 15px rgba(255,255,255,0.1)",
    backgroundImage:
      "repeating-radial-gradient(circle at center, transparent, transparent 5px, rgba(255,255,255,0.03) 5px, rgba(255,255,255,0.03) 6px)",
  },
  controlRow: {
    marginTop: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  jogLabel: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#888",
    letterSpacing: "1px",
  },
  modeButton: {
    padding: "4px 8px",
    fontSize: "10px",
    fontWeight: "bold",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    letterSpacing: "1px",
  },
};

export default JogWheel;
