import React, { useRef, useState } from "react";

const CuePointsManager = ({
  // Audio reference
  audioRef,

  // Cue points state
  cuePoints,
  setCuePoints,
  selectedCue,
  setSelectedCue,

  // Navigation functions
  jumpToCuePoint,
  crossfadeTo,

  // Utility functions
  formatTime,

  // Crossfade controls
  crossfaderValue,
  handleCrossfade,
  showCrossfadeControls = false,
  setShowCrossfadeControls,
}) => {
  const [cuePoint, setCuePoint] = useState(null);
  const cueListRef = useRef(null);

  // Set cue point at current position
  const setCuePointHandler = () => {
    if (audioRef?.current) {
      setCuePoint(audioRef.current.currentTime);
    }
  };

  // Add cue point to list
  const addCuePoint = () => {
    if (audioRef?.current) {
      const newCue = {
        id: Date.now(), // Unique ID for each cue point
        label: `CUE ${cuePoints.length + 1}`,
        time: audioRef.current.currentTime,
      };
      setCuePoints([...cuePoints, newCue]);
      setSelectedCue(cuePoints.length);
    }
  };

  // Navigate to cue point with crossfade
  const goToCuePoint = (time, index) => {
    if (audioRef?.current) {
      // Always use crossfade for cue point navigation
      crossfadeTo(time);
      setSelectedCue(index);

      // Ensure playback continues if it was playing
      if (!audioRef.current.paused) {
        audioRef.current
          .play()
          .catch((e) => console.error("Playback error:", e));
      }
    }
  };

  // Jump to temporary cue point with crossfade
  const jumpToTempCuePoint = () => {
    if (audioRef?.current && cuePoint !== null) {
      // Use crossfade for temporary cue point as well
      crossfadeTo(cuePoint);
    }
  };

  // Remove cue point
  const removeCuePoint = (id, event) => {
    if (event) {
      event.stopPropagation();
    }

    const updatedCues = cuePoints.filter((cue) => cue.id !== id);
    setCuePoints(updatedCues);

    if (selectedCue !== null && cuePoints[selectedCue]?.id === id) {
      setSelectedCue(null);
    }
  };

  // Toggle crossfade controls
  const toggleCrossfadeControls = () => {
    if (setShowCrossfadeControls) {
      setShowCrossfadeControls(!showCrossfadeControls);
    }
  };

  return (
    <div style={styles.container}>
      {/* Control Buttons */}
      <div style={styles.cueControls}>
        {/* Set cue button */}
        <button
          style={{
            ...styles.cueButton,
            backgroundColor: cuePoint !== null ? "#FF5500" : "#333",
          }}
          onClick={setCuePointHandler}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <circle cx="12" cy="12" r="5" />
          </svg>
          <span>SET CUE</span>
        </button>

        {/* Jump to cue button */}
        <button
          style={{
            ...styles.cueButton,
            opacity: cuePoint !== null ? 1 : 0.5,
            cursor: cuePoint !== null ? "pointer" : "not-allowed",
          }}
          onClick={jumpToTempCuePoint}
          disabled={cuePoint === null}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
          </svg>
          <span>CUE JUMP</span>
        </button>

        {/* Add to cue list button */}
        <button
          style={styles.addCueButton}
          onClick={addCuePoint}
          title="Add Cue Point"
        >
          <div style={styles.plusIcon}>+</div>
          <span style={styles.addCueText}>CUE</span>
        </button>

        {/* Crossfade Toggle Button */}
        {setShowCrossfadeControls && (
          <button
            style={{
              ...styles.crossfadeToggle,
              backgroundColor: showCrossfadeControls ? "#00c3ff" : "#333",
            }}
            onClick={toggleCrossfadeControls}
            title="Crossfade Settings"
          >
            FADE
          </button>
        )}
      </div>

      {/* Cue Points List (Horizontal Scrollable) */}
      <div style={styles.cueListWrapper}>
        <div ref={cueListRef} style={styles.cueListContainer}>
          {cuePoints.length === 0 ? (
            <div style={styles.noCues}>No cue points added</div>
          ) : (
            cuePoints.map((cue, index) => (
              <div
                key={cue.id}
                style={{
                  ...styles.cueItem,
                  backgroundColor: selectedCue === index ? "#FF5500" : "#333",
                }}
                onClick={() => goToCuePoint(cue.time, index)}
                title={`Jump to ${formatTime(cue.time)} with crossfade`}
              >
                <span style={styles.cueLabel}>
                  {cue.label} [{formatTime(cue.time)}]
                </span>
                <button
                  style={styles.deleteCueButton}
                  onClick={(e) => removeCuePoint(cue.id, e)}
                  title="Remove cue point"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Crossfader UI Section (conditionally rendered) */}
      {showCrossfadeControls && (
        <div style={styles.crossfaderSection}>
          <span style={styles.sectionTitle}>CROSSFADER</span>
          <div style={styles.crossfaderControl}>
            <span style={styles.deckLabel}>DECK A</span>
            <input
              type="range"
              min="0"
              max="100"
              value={crossfaderValue || 50}
              onChange={(e) => handleCrossfade(parseInt(e.target.value))}
              style={styles.crossfaderSlider}
            />
            <span style={styles.deckLabel}>DECK B</span>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    marginTop: "15px",
  },
  cueControls: {
    display: "flex",
    gap: "8px",
    marginBottom: "10px",
  },
  cueButton: {
    backgroundColor: "#333",
    color: "white",
    height: "34px",
    padding: "0 12px",
    borderRadius: "17px",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontWeight: "bold",
    fontSize: "12px",
  },
  addCueButton: {
    backgroundColor: "#333",
    color: "white",
    border: "none",
    borderRadius: "20px",
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  plusIcon: {
    fontSize: "18px",
    fontWeight: "bold",
    marginRight: "5px",
  },
  addCueText: {
    fontSize: "12px",
    fontWeight: "bold",
  },
  crossfadeToggle: {
    backgroundColor: "#333",
    color: "white",
    border: "none",
    borderRadius: "20px",
    padding: "8px 12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "12px",
    fontWeight: "bold",
  },
  // Cue List styles
  cueListWrapper: {
    width: "100%",
    padding: "5px 0",
    borderTop: "1px solid #444",
  },
  cueListContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    overflowX: "auto",
    overflowY: "hidden",
    scrollbarWidth: "thin",
    scrollbarColor: "#555 #222",
    gap: "10px",
    padding: "10px 0",
    maxWidth: "100%",
    whiteSpace: "nowrap",
  },
  cueItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#333",
    borderRadius: "4px",
    padding: "8px 12px",
    cursor: "pointer",
    minWidth: "90px",
    maxWidth: "150px",
    flexShrink: 0,
    transition: "all 0.2s ease",
    position: "relative",
  },
  cueLabel: {
    fontSize: "12px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },
  deleteCueButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    padding: "0 4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  noCues: {
    textAlign: "center",
    color: "#777",
    padding: "10px",
    fontSize: "12px",
    width: "100%",
  },
  // Crossfader styles
  crossfaderSection: {
    backgroundColor: "#1a1a1a",
    borderRadius: "6px",
    padding: "12px",
    border: "1px solid #444",
    marginTop: "15px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#00c3ff",
    letterSpacing: "1px",
  },
  crossfaderControl: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  crossfaderSlider: {
    flex: 1,
    margin: "0 10px",
    height: "10px",
    accentColor: "#00c3ff",
  },
  deckLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#fff",
    width: "50px",
    textAlign: "center",
  },
};

export default CuePointsManager;
