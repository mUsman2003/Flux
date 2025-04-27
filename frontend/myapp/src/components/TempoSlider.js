import React, { useState, useEffect } from "react";

const TempoSlider = ({ audioRef, tempoRef }) => {
  const [tempo, setTempo] = useState(1);

  // Handle tempo change
  const handleTempoChange = (e) => {
    const newTempo = parseFloat(e.target.value);
    setTempo(newTempo);

    if (audioRef?.current) {
      audioRef.current.playbackRate = newTempo;
    }
  };

  // Update the tempo when the audio's playbackRate changes from external source
  useEffect(() => {
    if (audioRef?.current) {
      // Set initial state from audio if available
      setTempo(audioRef.current.playbackRate || 1);

      // We could add a listener for rate changes, but that's complex
      // For now, we'll rely on the sync button directly setting values
    }
  }, [audioRef]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>TEMPO</span>
        <span style={styles.value}>{(tempo * 100).toFixed(0)}%</span>
      </div>

      <input
        type="range"
        min="0.5"
        max="2.0"
        step="0.01"
        value={tempo}
        onChange={handleTempoChange}
        style={styles.slider}
        ref={tempoRef}
      />
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  label: {
    color: "#00c3ff",
    fontWeight: "bold",
    fontSize: "12px",
  },
  value: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: "12px",
  },
  slider: {
    width: "100%",
    accentColor: "#00c3ff",
    cursor: "pointer",
  },
};

export default TempoSlider;
