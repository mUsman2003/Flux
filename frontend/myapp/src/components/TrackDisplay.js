import React, { useState, useRef, useEffect } from "react";
import ControlButtons from "./ControlButtons";

const TrackDisplay = ({ onTrackLoaded, deck }) => {
  const [audioFile, setAudioFile] = useState(null);
  const [audioSrc, setAudioSrc] = useState("");
  const audioRef = useRef(null);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const src = URL.createObjectURL(file);
      setAudioFile(file);
      setAudioSrc(src);
    }
  };

  // If the audio file changes, update the ref
  useEffect(() => {
    if (audioRef.current) {
      // Send the audio ref to the parent component
      onTrackLoaded({
        audioRef,  // Pass the ref back to parent
        deck,      // Pass the current deck (A or B)
        fileName: audioFile ? audioFile.name : null,
        audioSrc: audioSrc,
      });
      console.log(`Current deck: ${deck}`);
    }
  }, [audioSrc, audioFile, onTrackLoaded, deck]);

  return (
    <div style={styles.track}>
      <p>{audioFile ? audioFile.name : "Load Track..."}</p>
      <div style={styles.waveform}></div>

      {/* Hidden file input */}
      <input
        type="file"
        accept="audio/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
        id={`file-input-${deck}`}  // Ensure unique ID for each deck
      />

      {/* Plus button to select a song */}
      <button
        style={styles.plusButton}
        onClick={() => document.getElementById(`file-input-${deck}`).click()}  // Reference specific deck
      >
        +
      </button>

      {/* Audio element */}
      {audioSrc && <audio ref={audioRef} src={audioSrc} />}

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
  playPauseButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default TrackDisplay;
