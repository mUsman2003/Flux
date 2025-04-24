import React, { useState } from "react";
import TrackDisplay from "./TrackDisplay";
import Knob from "./Knob";
import VolumeSlider from "./VolumeSlider";
import SyncButton from "./SyncButton";
import JogWheel from "./JogWheel";

const DJController = () => {
  const [deckA, setDeckA] = useState(null);  // Deck A state
  const [deckB, setDeckB] = useState(null);  // Deck B state

  // Called when a track is loaded in TrackDisplay A
  const handleTrackLoadedA = ({ audioRef, deck, fileName, audioSrc }) => {
    setDeckA(audioRef);  // Set deck A's audio ref
  };

  // Called when a track is loaded in TrackDisplay B
  const handleTrackLoadedB = ({ audioRef, deck, fileName, audioSrc }) => {
    setDeckB(audioRef);  // Set deck B's audio ref
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Digital DJ Suite</h2>

      {/* Track Displays */}
      <div style={styles.trackContainer}>
        <TrackDisplay onTrackLoaded={handleTrackLoadedA} deck="A" />
        <TrackDisplay onTrackLoaded={handleTrackLoadedB} deck="B" />
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <JogWheel />

        <div style={styles.mixer}>
          <Knob label="High" />
          <Knob label="Mid" />
          <Knob label="Low" />
          <SyncButton />
          <VolumeSlider audioRef={deckA} />
        </div>

        <div style={styles.mixer}>
          <Knob label="High" />
          <Knob label="Mid" />
          <Knob label="Low" />
          <SyncButton />
          <VolumeSlider audioRef={deckB} />
        </div>

        <JogWheel />
      </div>
    </div>
  );
};

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
    marginBottom: "150px",
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
};

export default DJController;
