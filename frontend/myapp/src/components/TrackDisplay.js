import React, { useState, useRef, useEffect } from "react";
import ControlButtons from "./ControlButtons";
import AddSongModal from "./AddSongModal"; // Import modal

const TrackDisplay = ({ onTrackLoaded, deck }) => {
  const [audioFile, setAudioFile] = useState(null);
  const [audioSrc, setAudioSrc] = useState("");
  const [showModal, setShowModal] = useState(false);
  const audioRef = useRef(null);

  // When file is chosen (local)
  const handleFileUpload = (file) => {
    const src = URL.createObjectURL(file);
    setAudioFile(file);
    setAudioSrc(src);
  };

  // When song is selected from DB
  const handleDatabaseSong = (song) => {
    setAudioFile({ name: song.name });
    setAudioSrc(song.url);
  };

  useEffect(() => {
    if (audioRef.current) {
      onTrackLoaded({
        audioRef,
        deck,
        fileName: audioFile ? audioFile.name : null,
        audioSrc: audioSrc,
      });
    }
  }, [audioSrc, audioFile, onTrackLoaded, deck]);

  return (
    <div style={styles.track}>
      <p>{audioFile ? audioFile.name : "Load Track..."}</p>
      <div style={styles.waveform}></div>

      {/* Add song button */}
      <button style={styles.plusButton} onClick={() => setShowModal(true)}>
        +
      </button>

      {/* Modal with upload options */}
      {showModal && (
        <AddSongModal
          onClose={() => setShowModal(false)}
          onSelectFile={handleFileUpload}
          onSelectDatabaseSong={handleDatabaseSong}
        />
      )}

      {/* Audio playback */}
      {audioSrc && <audio ref={audioRef} src={audioSrc} />}
      <audio ref={audioRef} src={audioSrc} controls />

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
};

export default TrackDisplay;
