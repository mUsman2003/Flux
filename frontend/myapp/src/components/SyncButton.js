import React from "react";

const SyncButton = () => {
  return <button style={styles.button}>Sync</button>;
};

const styles = {
  button: {
    backgroundColor: "#66ccff",
    color: "black",
    borderRadius: "5px",
    padding: "5px 10px",
    border: "none",
    cursor: "pointer",
  },
};

export default SyncButton;
