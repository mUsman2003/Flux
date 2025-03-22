import React from "react";

const Knob = ({ label }) => {
  return (
    <div style={styles.knobContainer}>
      <div style={styles.knob}></div>
      <p>{label}</p>
    </div>
  );
};

const styles = {
  knobContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  knob: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#333",
    border: "2px solid white",
  },
};

export default Knob;
