import React, { useState, useRef } from "react";
import TrackDisplay from "./TrackDisplay";
import Knob from "./Knob";
import VolumeSlider from "./VolumeSlider";
import SyncButton from "./SyncButton";
import JogWheel from "./JogWheel";
import AudioEffects from "./AudioEffects";
import MicrophoneInput from "./MicrophoneInput";
import TempoSlider from "./TempoSlider";
import { useEQControls } from "./useEQControls"; // Import our new hook

const DJController = () => {
  const [deckA, setDeckA] = useState(null);
  const [deckB, setDeckB] = useState(null);
  const [fadeDuration, setFadeDuration] = useState(1);
  const deckAOriginalVolume = useRef(1);
  const deckBOriginalVolume = useRef(1);

  // Create refs to store tempo slider references
  const deckATempoRef = useRef(null);
  const deckBTempoRef = useRef(null);

  // Track which deck is currently the master (for sync)
  const [masterDeck, setMasterDeck] = useState("A");

  // EQ state for both decks
  const [deckAHighEQ, setDeckAHighEQ] = useState(0);
  const [deckAMidEQ, setDeckAMidEQ] = useState(0);
  const [deckALowEQ, setDeckALowEQ] = useState(0);

  const [deckBHighEQ, setDeckBHighEQ] = useState(0);
  const [deckBMidEQ, setDeckBMidEQ] = useState(0);
  const [deckBLowEQ, setDeckBLowEQ] = useState(0);

  const deckAEQ = useEQControls(deckA);
  const deckBEQ = useEQControls(deckB);

  const handleTrackLoadedA = ({ audioRef, deck, fileName, audioSrc }) => {
    setDeckA(audioRef);
    if (audioRef?.current) {
      deckAOriginalVolume.current = audioRef.current.volume;
      // Start with deck A at full volume if it's the first deck loaded
      if (!deckB) {
        audioRef.current.volume = 1;
      }
    }
  };

  const handleTrackLoadedB = ({ audioRef, deck, fileName, audioSrc }) => {
    setDeckB(audioRef);
    if (audioRef?.current) {
      deckBOriginalVolume.current = audioRef.current.volume;
      // Start with deck B silent if deck A is already playing
      if (deckA) {
        audioRef.current.volume = 1;
      }
    }
  };

  // Toggle which deck is the master for syncing
  const toggleMasterDeck = () => {
    setMasterDeck(masterDeck === "A" ? "B" : "A");
  };

  // EQ Handler functions
  const handleDeckAHighEQ = (value) => deckAEQ.setHighEQ(value);
  const handleDeckAMidEQ = (value) => deckAEQ.setMidEQ(value);
  const handleDeckALowEQ = (value) => deckAEQ.setLowEQ(value);

  const handleDeckBHighEQ = (value) => deckBEQ.setHighEQ(value);
  const handleDeckBMidEQ = (value) => deckBEQ.setMidEQ(value);
  const handleDeckBLowEQ = (value) => deckBEQ.setLowEQ(value);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>DIGITAL DJ PRO</h2>
        <div style={styles.masterToggle}>
          <span
            style={{
              ...styles.masterIndicator,
              backgroundColor: masterDeck === "A" ? "#00c3ff" : "#333",
            }}
          >
            DECK A MASTER
          </span>
          <button onClick={toggleMasterDeck} style={styles.toggleButton}>
            SWAP
          </button>
          <span
            style={{
              ...styles.masterIndicator,
              backgroundColor: masterDeck === "B" ? "#00c3ff" : "#333",
            }}
          >
            DECK B MASTER
          </span>
        </div>
        <div style={styles.logo}>DJ PRO</div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.decksContainer}>
          {/* DECK A */}
          <div style={styles.deck}>
            <div style={styles.deckHeader}>
              <h3 style={styles.deckTitle}>DECK A</h3>
              {masterDeck === "A" && (
                <span style={styles.masterBadge}>MASTER</span>
              )}
            </div>

            <TrackDisplay
              onTrackLoaded={handleTrackLoadedA}
              deck="A"
              fadeDuration={fadeDuration}
            />
            <div style={styles.deckControls}>
              {/* Pass the audioRef to JogWheel */}
              <JogWheel audioRef={deckA} side="left" />

              <div style={styles.eqSection}>
                <Knob
                  label="HIGH"
                  color="#00c3ff"
                  min={-12}
                  max={12}
                  defaultValue={0}
                  onChange={handleDeckAHighEQ}
                />
                <Knob
                  label="MID"
                  color="#9146ff"
                  min={-12}
                  max={12}
                  defaultValue={0}
                  onChange={handleDeckAMidEQ}
                />
                <Knob
                  label="LOW"
                  color="#ff3860"
                  min={-12}
                  max={12}
                  defaultValue={0}
                  onChange={handleDeckALowEQ}
                />
              </div>

              <div style={styles.volumeSection}>
                <SyncButton
                  masterDeck={masterDeck === "A" ? deckA : deckB}
                  slaveDeck={masterDeck === "A" ? deckB : deckA}
                  tempoRef={masterDeck === "A" ? deckBTempoRef : deckATempoRef}
                />
                <VolumeSlider audioRef={deckA} side="left" />
              </div>
            </div>

            {/* Add Tempo Slider for Deck A */}
            <div style={styles.tempoContainer}>
              <TempoSlider audioRef={deckA} tempoRef={deckATempoRef} />
            </div>

            {deckA && (
              <AudioEffects audioRef={deckA} style={{ width: "100%" }} />
            )}
          </div>

          {/* MIXER SECTION */}
          <div style={styles.mixer}>
            <div style={styles.crossfaderContainer}>CROSSFADER</div>

            <div style={styles.fadeControlContainer}>
              <div style={styles.fadeControl}>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={fadeDuration}
                  onChange={(e) => setFadeDuration(parseFloat(e.target.value))}
                  style={styles.fadeSlider}
                />
                <div style={styles.fadeValue}>{fadeDuration.toFixed(1)}s</div>
              </div>
            </div>
          </div>

          {/* DECK B */}
          <div style={styles.deck}>
            <div style={styles.deckHeader}>
              <h3 style={styles.deckTitle}>DECK B</h3>
              {masterDeck === "B" && (
                <span style={styles.masterBadge}>MASTER</span>
              )}
            </div>

            <TrackDisplay
              onTrackLoaded={handleTrackLoadedB}
              deck="B"
              fadeDuration={fadeDuration}
            />
            <div style={styles.deckControls}>
              {/* Pass the audioRef to JogWheel */}
              <JogWheel audioRef={deckB} side="right" />

              <div style={styles.eqSection}>
                <Knob
                  label="HIGH"
                  color="#00c3ff"
                  min={-12}
                  max={12}
                  defaultValue={0}
                  onChange={handleDeckBHighEQ}
                />
                <Knob
                  label="MID"
                  color="#9146ff"
                  min={-12}
                  max={12}
                  defaultValue={0}
                  onChange={handleDeckBMidEQ}
                />
                <Knob
                  label="LOW"
                  color="#ff3860"
                  min={-12}
                  max={12}
                  defaultValue={0}
                  onChange={handleDeckBLowEQ}
                />
              </div>

              <div style={styles.volumeSection}>
                <SyncButton
                  masterDeck={masterDeck === "B" ? deckB : deckA}
                  slaveDeck={masterDeck === "B" ? deckA : deckB}
                  tempoRef={masterDeck === "B" ? deckATempoRef : deckBTempoRef}
                />
                <VolumeSlider audioRef={deckB} side="right" />
              </div>
            </div>

            {/* Add Tempo Slider for Deck B */}
            <div style={styles.tempoContainer}>
              <TempoSlider audioRef={deckB} tempoRef={deckBTempoRef} />
            </div>

            {deckB && (
              <AudioEffects audioRef={deckB} style={{ width: "100%" }} />
            )}
          </div>
        </div>

        {/* Add Microphone Input Panel */}
        <div style={styles.micPanel}>
          <MicrophoneInput />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#1a1a1a",
    color: "#e0e0e0",
    padding: "20px",
    borderRadius: "10px",
    width: "100%",
    maxWidth: "1600px",
    margin: "auto",
    boxShadow: "0 10px 25px rgba(0, 17, 255, 0.5)",
    border: "1px solid #333",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2px solid #333",
    paddingBottom: "10px",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0,
    color: "#00c3ff",
    letterSpacing: "2px",
  },
  logo: {
    backgroundColor: "#00c3ff",
    color: "#000",
    padding: "5px 10px",
    borderRadius: "5px",
    fontWeight: "bold",
    letterSpacing: "1px",
  },
  mainContent: {
    display: "flex",
    gap: "20px",
    overflow: "visible", // Ensure nested overflow is visible
  },
  decksContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "30px",
    flex: 1,
    overflow: "visible", // Allow content to expand
  },
  deck: {
    flex: "1",
    backgroundColor: "#222",
    borderRadius: "8px",
    padding: "15px",
    border: "1px solid #444",
    minWidth: "400px", // Prevent decks from shrinking too much
    overflow: "hidden", // Prevents content from protruding
    position: "relative", // For child positioning context
  },
  deckHeader: {
    borderBottom: "1px solid #444",
    marginBottom: "15px",
    paddingBottom: "5px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deckTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "bold",
    color: "#00c3ff",
  },
  masterBadge: {
    backgroundColor: "#00c3ff",
    color: "#000",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "bold",
  },
  masterToggle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  masterIndicator: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    color: "#fff",
    fontWeight: "bold",
  },
  toggleButton: {
    backgroundColor: "#333",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: "4px",
    padding: "4px 8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  },
  deckControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
  },
  eqSection: {
    display: "flex",
    gap: "15px",
  },
  volumeSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  mixer: {
    width: "80px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
  },
  crossfaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#333",
    padding: "15px 5px",
    borderRadius: "8px",
    border: "1px solid #444",
    boxShadow: "0 2px 10px rgba(168, 93, 12, 0.54)",
  },
  crossfaderLabel: {
    color: "#fff",
    fontSize: "10px",
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: "1px",
    marginBottom: "5px",
    textTransform: "uppercase",
  },
  deckLabel: {
    color: "#00c3ff",
    fontWeight: "bold",
    fontSize: "16px",
    margin: "5px 0",
  },
  fadeControlContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "200px",
    justifyContent: "space-between",
  },
  fadeControl: {
    backgroundColor: "#2a2a2a",
    padding: "15px 10px",
    borderRadius: "8px",
    border: "1px solid #444",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
    justifyContent: "space-between",
  },
  fadeSlider: {
    width: "6px",
    height: "150px",
    WebkitAppearance: "slider-vertical",
    accentColor: "#00c3ff",
    cursor: "pointer",
  },
  fadeValue: {
    color: "#fff",
    fontSize: "12px",
    fontWeight: "bold",
    marginTop: "10px",
  },
  micPanel: {
    height: "100%",
    display: "flex",
    alignItems: "stretch", // Make the MicrophoneInput component stretch to full height
  },
  tempoContainer: {
    marginTop: "15px",
    backgroundColor: "#2a2a2a",
    borderRadius: "6px",
    padding: "12px",
    border: "1px solid #444",
  },
};

export default DJController;
