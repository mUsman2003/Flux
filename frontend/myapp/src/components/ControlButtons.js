import React, { useState } from "react";

const ControlButtons = ({ audioRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.cue}>Cue</button>
      <button style={styles.play} onClick={handlePlayPause}>
        {isPlaying ? "⏸" : "▶"}
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  cue: {
    backgroundColor: "black",
    color: "white",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid white",
    cursor: "pointer",
  },
  play: {
    backgroundColor: "#222",
    color: "white",
    padding: "10px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
  },
};

export default ControlButtons;
