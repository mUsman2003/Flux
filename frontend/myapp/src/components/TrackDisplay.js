import React from "react";

const TrackDisplay = () => {
  return (
    <div style={styles.track}>
      <p>Load Track...</p>
      <div style={styles.waveform}></div>
    </div>
  );
};

const styles = {
  track: {
    backgroundColor: "#1a1a1a",
    padding: "10px",
    borderRadius: "5px",
    width: "45%",
    height: "100px",
    display: "flex",
    flexDirection: "column",
  },
  waveform: {
    backgroundColor: "#ffffff",
    height: "50px",
    borderRadius: "3px",
    marginTop: "5px",
  },
};

export default TrackDisplay;
