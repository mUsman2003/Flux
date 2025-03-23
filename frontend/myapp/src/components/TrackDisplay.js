import React, { useState, useRef } from "react";
import ControlButtons from "./ControlButtons";

const TrackDisplay = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [audioSrc, setAudioSrc] = useState("");
  const audioRef = useRef(null);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
      setAudioSrc(URL.createObjectURL(file));
    }
  };

  return (
    <div style={styles.track}>
      <p>{audioFile ? audioFile.name : "Load Track..."}</p>
      <div style={styles.waveform}></div>

      {/* Hidden file input */}
      <input
        type="file"
        accept="audio/*"
        style={{ display: "none" }}
        id={`fileInput-${audioSrc}`}
        onChange={handleFileChange}
      />

      {/* Plus button to select a song */}
      <button
        style={styles.plusButton}
        onClick={() => document.getElementById(`fileInput-${audioSrc}`).click()}
      >
        +
      </button>

      {/* Audio player */}
      {audioSrc && <audio ref={audioRef} src={audioSrc} controls style={styles.audioPlayer} />}

      {/* Playback Controls */}
      <ControlButtons audioRef={audioRef} />
    </div>
  );
};

const styles = {
  track: {
    backgroundColor: "#1a1a1a",
    padding: "10px",
    borderRadius: "5px",
    width: "45%",
    height: "150px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  },
  waveform: {
    backgroundColor: "#ffffff",
    height: "50px",
    borderRadius: "3px",
    marginTop: "5px",
    width: "100%",
  },
  plusButton: {
    backgroundColor: "#333",
    color: "white",
    fontSize: "24px",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    cursor: "pointer",
    marginTop: "10px",
  },
  audioPlayer: {
    marginTop: "10px",
    width: "100%",
  },
};

export default TrackDisplay;
