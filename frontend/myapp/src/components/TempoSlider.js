import React, { useState, useEffect, useRef } from "react";

const TempoSlider = ({ audioRef, tempoRef }) => {
  const [tempo, setTempo] = useState(1);
  const sliderRef = useRef(null);

  // Handle tempo change from slider
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

      // Create a MutationObserver to watch for playbackRate changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "playbackRate"
          ) {
            setTempo(audioRef.current.playbackRate);
          }
        });
      });

      // Setup polling mechanism to check for playbackRate changes
      const checkPlaybackRate = () => {
        const currentRate = audioRef.current?.playbackRate || 1;
        if (currentRate !== tempo) {
          setTempo(currentRate);
        }
      };

      const intervalId = setInterval(checkPlaybackRate, 200);

      // Expose the slider's DOM element via the ref for external components
      if (tempoRef) {
        tempoRef.current = sliderRef.current;
      }

      return () => {
        clearInterval(intervalId);
        observer.disconnect();
      };
    }
  }, [audioRef, tempo, tempoRef]);

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
        ref={sliderRef}
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
