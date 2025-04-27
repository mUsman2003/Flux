import React from "react";

const CrossfadeControls = ({ fadeDuration, setFadeDuration }) => {
  return (
    <div style={styles.crossfadeControls}>
      <div style={styles.crossfadeSliderContainer}>
        <span style={styles.sliderLabel}>
          Crossfade: {fadeDuration.toFixed(1)}s
        </span>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={fadeDuration}
          onChange={(e) => setFadeDuration(parseFloat(e.target.value))}
          style={styles.crossfadeSlider}
        />
      </div>
    </div>
  );
};

const styles = {
  crossfadeControls: {
    backgroundColor: "#2a2a2a",
    padding: "10px",
    borderRadius: "8px",
    marginTop: "10px",
    border: "1px solid #444",
    
  },
  crossfadeSliderContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    fontWeight: "bold",
  },
  crossfadeSlider: {
    width: "100%",
    accentColor: "#00c3ff",
  },
  sliderLabel: {
    color: "#aaa",
    fontSize: "12px",
    fontWeight: "bold",
  },
};

export default CrossfadeControls;