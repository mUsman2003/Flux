import React from "react";

const VolumeSlider = () => {
  return (
    <div style={styles.container}>
      <input type="range" min="0" max="100" style={styles.slider} />
      <p>Volume</p>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  slider: {
    width: "50px",
    transform: "rotate(-90deg)",
  },
};

export default VolumeSlider;
