import React, { useState } from "react";

const TempoSlider = ({ audioRef }) => {
  const [tempo, setTempo] = useState(1);

  const handleTempoChange = (e) => {
    const value = parseFloat(e.target.value);
    setTempo(value);
    if (audioRef?.current) {
      audioRef.current.playbackRate = value;
    }
  };

  return (
    <div style={styles.tempoContainer}>
      <label style={styles.label}>TEMPO: {tempo.toFixed(2)}x</label>
      <input
        type="range"
        min="0.5"
        max="2"
        step="0.01"
        value={tempo}
        onChange={handleTempoChange}
        style={styles.slider}
      />
    </div>
  );
};

const styles = {
  tempoContainer: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  label: {
    fontSize: "12px",
    marginBottom: "6px",
    color: "#999",
    fontWeight: "bold",
  },
  slider: {
    width: "100%",
    accentColor: "#FF5500",
  },
};

export default TempoSlider;