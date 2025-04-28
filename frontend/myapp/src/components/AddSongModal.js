import React, { useState } from "react";
import SongLibrary from "./SongLibrary";
import CuePointsManager from "./CuePointsManager";

const AddSongModal = ({ onClose, onSelectFile, onSelectDatabaseSong }) => {
  const [showList, setShowList] = useState(false);
  const [cuePoints, setCuePoints] = useState([]);
  const [selectedCue, setSelectedCue] = useState(null);
  const [crossfaderValue, setCrossfaderValue] = useState(50);

  // Add Cue Point - Restored functionality
  const addCuePoint = (currentTime) => {
    const newCue = {
      label: `CUE ${cuePoints.length + 1}`,
      time: currentTime,
    };
    setCuePoints([...cuePoints, newCue]);
    setSelectedCue(cuePoints.length);
  };

  // Handle Crossfader Logic - Fixed to maintain original volume levels
  const handleCrossfade = (value, deckA, deckB) => {
    setCrossfaderValue(value);

    if (deckA?.current && deckB?.current) {
      // Store original volumes if not already stored
      if (!deckA.current.originalVolume) {
        deckA.current.originalVolume = deckA.current.volume;
      }
      if (!deckB.current.originalVolume) {
        deckB.current.originalVolume = deckB.current.volume;
      }

      // Calculate new volumes based on crossfader position
      // When value is 50, both decks play at their original volumes
      // When value is 0, only deckA plays at original volume, deckB is silent
      // When value is 100, only deckB plays at original volume, deckA is silent
      const valueA = value < 50 ? 1 : 1 - (value - 50) / 50;
      const valueB = value > 50 ? 1 : value / 50;
      console.log(deckA.current.time);
      deckA.current.volume = valueA * deckA.current.originalVolume;
      deckB.current.volume = valueB * deckB.current.originalVolume;
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={styles.title}>ADD TRACK</h3>
          <button onClick={onClose} style={styles.closeIcon}>
            ×
          </button>
        </div>

        {!showList ? (
          <div style={styles.optionsContainer}>
            <button
              style={styles.optionButton}
              onClick={() => document.getElementById("fileInput").click()}
            >
              <div style={styles.optionIcon}>📁</div>
              <div style={styles.optionText}>
                <span style={styles.optionTitle}>Upload Track</span>
                <span style={styles.optionDescription}>From your computer</span>
              </div>
            </button>

            <input
              id="fileInput"
              type="file"
              accept="audio/*"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  onSelectFile(e.target.files[0]);
                  onClose();
                }
              }}
            />

            <button
              style={styles.optionButton}
              onClick={() => setShowList(true)}
            >
              <div style={styles.optionIcon}>🎵</div>
              <div style={styles.optionText}>
                <span style={styles.optionTitle}>Track Library</span>
                <span style={styles.optionDescription}>
                  Choose from database
                </span>
              </div>
            </button>

            {/* Cue Points Manager Component */}
            <CuePointsManager
              cuePoints={cuePoints}
              selectedCue={selectedCue}
              setSelectedCue={setSelectedCue}
              addCuePoint={addCuePoint}
              crossfaderValue={crossfaderValue}
              handleCrossfade={handleCrossfade}
            />
          </div>
        ) : (
          <SongLibrary
            onSelectDatabaseSong={onSelectDatabaseSong}
            onClose={onClose}
            goBack={() => {
              setShowList(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    width: "100vw",
    height: "100vh",
  },
  modal: {
    width: "400px",
    background: "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)",
    borderRadius: "8px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
    color: "#fff",
    overflow: "hidden",
    border: "1px solid #333",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 15px",
    borderBottom: "1px solid #333",
    backgroundColor: "#222",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "#fff",
    letterSpacing: "1px",
  },
  closeIcon: {
    background: "none",
    border: "none",
    color: "#999",
    fontSize: "24px",
    cursor: "pointer",
    padding: "0 5px",
  },
  optionsContainer: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  optionButton: {
    display: "flex",
    alignItems: "center",
    background: "linear-gradient(180deg, #2d2d2d 0%, #222 100%)",
    border: "1px solid #444",
    borderRadius: "6px",
    padding: "15px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  optionIcon: {
    fontSize: "24px",
    marginRight: "15px",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#333",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    flex: 1,
  },
  optionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "4px",
  },
  optionDescription: {
    fontSize: "14px",
    color: "#999",
  },
};

export default AddSongModal;
