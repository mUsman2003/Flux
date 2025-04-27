import React, { useState, useRef } from "react";
import TrackDisplay from "./TrackDisplay";
import Knob from "./Knob";
import VolumeSlider from "./VolumeSlider";
import SyncButton from "./SyncButton";
import JogWheel from "./JogWheel";
import AudioEffects from "./AudioEffects";
import MicrophoneInput from "./MicrophoneInput";
import TempoSlider from "./TempoSlider";
import RecordingButton from "./RecordingButton";
import { useEQControls } from "./useEQControls";

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

  const handleTrackLoadedA = ({
    audioRef,
    deck,
    fileName,
    audioSrc,
    isInitial,
  }) => {
    setDeckA(audioRef);
    if (audioRef?.current) {
      deckAOriginalVolume.current = audioRef.current.volume;

      // Don't adjust volume if the other deck is playing - let crossfader handle it
      // Only adjust initial volume if there's no other deck or this isn't the first load
      if (!deckB || !isInitial) {
        audioRef.current.volume = 1;
      }
    }
  };

  const handleTrackLoadedB = ({
    audioRef,
    deck,
    fileName,
    audioSrc,
    isInitial,
  }) => {
    setDeckB(audioRef);
    if (audioRef?.current) {
      deckBOriginalVolume.current = audioRef.current.volume;

      // Don't adjust volume if the other deck is playing - let crossfader handle it
      // Only adjust initial volume if there's no other deck or this isn't the first load
      if (!deckA || !isInitial) {
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

        {/* Right side controls: Microphone and Recording */}
        <div style={styles.rightControls}>
          {/* Recording Panel - Added below the microphone input */}
          <div style={styles.recordPanel}>
            <RecordingButton deckA={deckA} deckB={deckB} />
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

          {/* Microphone Input Panel */}
          <div style={styles.micPanel}>
            <MicrophoneInput />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    flexWrap: "wrap",
    color: "#e0e0e0",
    padding: "10px",
    borderRadius: "10px",
    width: "95%",
    maxWidth: "1600px",
    margin: "auto",
    boxShadow: "0 10px 25px rgba(0, 17, 255, 0.5)",
    border: "1px solid #333",
    overflow: "hidden",
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
    overflow: "visible",
  },
  decksContainer: {
    display: "flex",
    flex: "2",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "20px",
    overflow: "visible",
  },
  deck: {
    flex: "1",
    backgroundColor: "#222",
    borderRadius: "8px",
    padding: "15px",
    border: "1px solid #444",
    minWidth: "400px",
    overflow: "hidden",
    position: "relative",
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
    backgroundColor: "#222",
    borderRadius: "8px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    border: "1px solid #444",
    width: "100%",
    boxSizing: "border-box",
  },
  crossfaderContainer: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#ff3860",
    borderBottom: "1px solid #444",
    paddingBottom: "10px",
    marginBottom: "10px",
  },
  fadeControlContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  fadeControl: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  fadeSlider: {
    width: "100%",
    height: "6px",
    backgroundColor: "#444",
    borderRadius: "5px",
    cursor: "pointer",
  },
  fadeValue: {
    fontSize: "14px",
    color: "#ddd",
    whiteSpace: "nowrap",
    overflow: "clip",
    textOverflow: "ellipsis",
  },
  deckLabel: {
    color: "#00c3ff",
    fontWeight: "bold",
    fontSize: "16px",
    margin: "5px 0",
  },
  rightControls: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "250px",
    flexShrink: "0",
  },
  micPanel: {
    flex: "1",
    overflow: "auto",
  },
  recordPanel: {
    flex: "0.5",
    overflow: "auto",
    marginBottom: "15px",
    scrollbarWidth: "none",
    borderBottom: "1px solid #444",
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
