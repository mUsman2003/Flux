import React from "react";
import TrackDisplay from "./TrackDisplay";
import Knob from "./Knob";
import VolumeSlider from "./VolumeSlider";
import SyncButton from "./SyncButton";
import JogWheel from "./JogWheel";
import ControlButtons from "./ControlButtons";

const DJController = () => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Digital DJ Suite</h2>
      
      {/* Track Displays */}
      <div style={styles.trackContainer}>
        <TrackDisplay />
        <TrackDisplay />
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <JogWheel />
        <div style={styles.mixer}>
          <Knob label="High" />
          <Knob label="Mid" />
          <Knob label="Low" />
          <SyncButton />
          <VolumeSlider />
        </div>
        <div style={styles.mixer}>
          <Knob label="High" />
          <Knob label="Mid" />
          <Knob label="Low" />
          <SyncButton />
          <VolumeSlider />
        </div>
        <JogWheel />
      </div>

      {/* Cue & Play Buttons */}
      <div style={styles.buttonContainer}>
        <ControlButtons />
        <ControlButtons />
      </div>
    </div>
  );
};

// Inline CSS
const styles = {
  container: {
    backgroundColor: "red",
    color: "white",
    padding: "20px",
    borderRadius: "10px",
    maxWidth: "90%",
    margin: "auto",
  },
  title: {
    textAlign: "left",
    fontSize: "24px",
    fontWeight: "bold",
  },
  trackContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  controls: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    gap: "20px",
  },
  mixer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
};

export default DJController;
