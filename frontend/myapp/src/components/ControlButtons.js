import React from "react";

const ControlButtons = () => {
  return (
    <div style={styles.container}>
      <button style={styles.cue}>Cue</button>
      <button style={styles.play}>▶</button>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    gap: "10px",
  },
  cue: {
    backgroundColor: "black",
    color: "white",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid white",
  },
  play: {
    backgroundColor: "#222",
    color: "white",
    padding: "10px",
    borderRadius: "50%",
    border: "none",
  },
};

export default ControlButtons;
