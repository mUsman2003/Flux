import React from "react";

const JogWheel = () => {
  return <div style={styles.wheel}></div>;
};

const styles = {
  wheel: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#222",
    border: "3px solid white",
  },
};

export default JogWheel;
