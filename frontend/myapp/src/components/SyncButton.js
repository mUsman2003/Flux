import React, { useState, useEffect } from "react";

const SyncButton = ({ masterDeck, slaveDeck, tempoRef }) => {
  const [active, setActive] = useState(false);

  const handleSync = () => {
    // Toggle active state
    setActive(!active);

    // Only sync if we have both decks and turning sync ON
    if (masterDeck?.current && slaveDeck?.current && !active) {
      // Get the current playback rate of the master deck
      const masterRate = masterDeck.current.playbackRate;

      // Apply the master deck's rate to the slave deck
      slaveDeck.current.playbackRate = masterRate;

      // If we have a tempo reference, update the displayed tempo
      if (tempoRef?.current) {
        tempoRef.current.value = masterRate;
      }

      // Optionally start the playback of the slave deck if it's paused
      if (
        masterDeck.current.paused === false &&
        slaveDeck.current.paused === true
      ) {
        slaveDeck.current.play();
      }
    }
  };

  // Disable sync if any deck is changed/removed
  useEffect(() => {
    if (!masterDeck?.current || !slaveDeck?.current) {
      setActive(false);
    }
  }, [masterDeck, slaveDeck]);

  return (
    <div style={styles.container}>
      <button
        style={{
          ...styles.button,
          backgroundColor: active ? "#00c6ff" : "#333",
          boxShadow: active ? "0 0 15px #00c6ff90" : "none",
        }}
        onClick={handleSync}
        disabled={!masterDeck?.current || !slaveDeck?.current}
      >
        SYNC
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "10px 0",
  },
  button: {
    backgroundColor: "red",
    fontWeight: "bold",
    color: "white",
    borderRadius: "10px",
    padding: "8px 16px",
    border: "1px solid #333",
    cursor: "pointer",
    letterSpacing: "1px",
    transition: "all 0.2s ease",
    minWidth: "80px",
    textAlign: "center",
    fontSize: "12px",
    fontFamily: "'Rajdhani', sans-serif",
  },
};

export default SyncButton;
