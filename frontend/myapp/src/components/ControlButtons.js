import React, { useState } from "react";
import useCrossfadeAudio from "./useCrossfadeAudio"; // Import the hook

const ControlButtons = ({ audioRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [cuePoints, setCuePoints] = useState([]);
  const [fadeDuration, setFadeDuration] = useState(1); // Example
  const [selectedCue, setSelectedCue] = useState(null); // Track the selected cue
  const { crossfadeTo } = useCrossfadeAudio(audioRef, fadeDuration);

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

  const addCuePoint = () => {
    if (audioRef.current) {
      const newCue = {
        label: `Cue ${cuePoints.length + 1}`,
        time: audioRef.current.currentTime,
      };
      setCuePoints([...cuePoints, newCue]);
    }
  };
  const goToCuePoint = (time, index) => {
    crossfadeTo(time); // Use crossfade instead of setting time directly
    setSelectedCue(index); // Highlight the cue
  };
  

  const removeCuePoint = (index) => {
    const updatedCues = cuePoints.filter((_, i) => i !== index);
    setCuePoints(updatedCues);
    if (selectedCue === index) {
      setSelectedCue(null); // Deselect the cue if it's removed
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Top Row: Play/Pause + Add Cue */}
      <div style={styles.topRow}>
        <button style={styles.play} onClick={handlePlayPause}>
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button style={styles.addCue} onClick={addCuePoint}>Add Cue</button>
      </div>

      {/* Bottom Row: Cue Buttons */}
      <div style={styles.cueList}>
        {cuePoints.map((cue, index) => (
          <div key={index} style={styles.cueItem}>
            <button
              onClick={() => goToCuePoint(cue.time, index)}
              style={selectedCue === index ? styles.selectedCue : styles.gotoCue} // Apply selected style
            >
              {cue.label}
            </button>
            <button onClick={() => removeCuePoint(index)} style={styles.deleteCue}>🗑</button>
          </div>
        ))}
      </div>
      <div style={styles.fadeControl}>
        <label style={styles.fadeLabel}>
          Fade Duration: {fadeDuration.toFixed(1)}s
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={fadeDuration}
          onChange={(e) => setFadeDuration(parseFloat(e.target.value))}
          style={styles.slider}
        />
      </div>

    </div>

  );
};

const styles = {
  wrapper: {
    marginTop: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
  },
  topRow: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    position: "sticky",
    top: 0,
    zIndex: 2,
    backgroundColor: "#121212",
    padding: "10px",
    borderRadius: "8px",
  },
  cueList: {
    display: "flex", // Align items horizontally
    gap: "10px", // Space between cues
    justifyContent: "flex-start", // Align cues to the left
    padding: "10px",
    borderRadius: "8px",
    backgroundColor: "#1e1e1e",
    maxWidth: "500px", // Adjust this as per your layout
    overflowX: "auto", // Enable horizontal scrolling
    whiteSpace: "nowrap", // Prevent line breaks
  },
  play: {
    backgroundColor: "#222",
    color: "white",
    padding: "10px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
  },
  addCue: {
    backgroundColor: "#1e90ff",
    color: "white",
    padding: "10px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  cueItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    minWidth: "120px", // Adjust the minimum width of cue items
  },
  gotoCue: {
    backgroundColor: "#444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "6px 12px",
    cursor: "pointer",
  },
  selectedCue: { // New style for selected cue
    backgroundColor: "#28a745", // Green color for selection
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "6px 12px",
    cursor: "pointer",
  },
  deleteCue: {
    backgroundColor: "red",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "6px",
    cursor: "pointer",
  },
  fadeControl: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "#1e1e1e",
    padding: "10px",
    borderRadius: "8px",
    width: "100%",
  },
  fadeLabel: {
    color: "white",
    fontSize: "14px",
  },
  slider: {
    width: "150px",
    accentColor: "#1e90ff",
  }
  
};

export default ControlButtons;
