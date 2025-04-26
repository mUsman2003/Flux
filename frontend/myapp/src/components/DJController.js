import React, { useState, useRef } from "react";
import TrackDisplay from "./TrackDisplay";
import Knob from "./Knob";
import VolumeSlider from "./VolumeSlider";
import SyncButton from "./SyncButton";
import JogWheel from "./JogWheel";
import AudioEffects from "./AudioEffects";
import useCrossfadeAudio from "./useCrossfadeAudio";

const DJController = () => {
  const [deckA, setDeckA] = useState(null);
  const [deckB, setDeckB] = useState(null);
  const [crossfaderValue, setCrossfaderValue] = useState(50);
  const [fadeDuration, setFadeDuration] = useState(1);
  const deckAOriginalVolume = useRef(1);
  const deckBOriginalVolume = useRef(1);

 const { crossfade } = useCrossfadeAudio(deckA, deckB, fadeDuration); // Properly destructure crossfade
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
        audioRef.current.volume = 0;
      }
    }
  };

  const handleCrossfaderChange = (e) => {
    const newValue = parseInt(e.target.value);
    setCrossfaderValue(newValue);
    
    // Determine crossfade direction based on previous and current values
    if (deckA?.current && deckB?.current) {
      if (newValue < 40 && crossfaderValue >= 40) {
        // Crossfade to deck A
        crossfade('BtoA');
      } else if (newValue > 60 && crossfaderValue <= 60) {
        // Crossfade to deck B
        crossfade('AtoB');
      } else if (newValue >= 40 && newValue <= 60) {
        // Middle position - both decks play at reduced volume
        const centerValue = (newValue - 50) / 10; // -1 to 1
        const volumeA = 0.5 - (centerValue * 0.5);
        const volumeB = 0.5 + (centerValue * 0.5);
        
        deckA.current.volume = volumeA * deckAOriginalVolume.current;
        deckB.current.volume = volumeB * deckBOriginalVolume.current;
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>DIGITAL DJ PRO</h2>
        <div style={styles.logo}>DJ PRO</div>
      </div>

      <div style={styles.decksContainer}>
        {/* DECK A */}
        <div style={styles.deck}>
          <div style={styles.deckHeader}>
            <h3 style={styles.deckTitle}>DECK A</h3>
          </div>
          
          {/* <TrackDisplay onTrackLoaded={handleTrackLoadedA} deck="A" /> */}
          <TrackDisplay 
          onTrackLoaded={handleTrackLoadedA} 
          deck="A" 
          fadeDuration={fadeDuration} // Add this prop
        />
          <div style={styles.deckControls}>
            <JogWheel />
            
            <div style={styles.eqSection}>
              <Knob label="HIGH" />
              <Knob label="MID" />
              <Knob label="LOW" />
            </div>
            
            <div style={styles.volumeSection}>
              <SyncButton />
              <VolumeSlider audioRef={deckA} side="left" />
            </div>
          </div>
          
          {deckA && <AudioEffects audioRef={deckA} />}
        </div>

        {/* MIXER SECTION */}
        <div style={styles.mixer}>
        <div style={styles.crossfaderContainer}>
          <span style={styles.deckLabel}>A</span>
          <div style={styles.crossfaderLabel}>CROSSFADER</div>
          <input
            type="range"
            min="0"
            max="100"
            value={crossfaderValue}
            onChange={handleCrossfaderChange}
            style={styles.crossfader}
          />
          <span style={styles.deckLabel}>B</span>
        </div>

        <div style={styles.fadeControl}>
          <label style={styles.fadeLabel}>Fade: {fadeDuration.toFixed(1)}s</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={fadeDuration}
            onChange={(e) => setFadeDuration(parseFloat(e.target.value))}
            style={styles.fadeSlider}
          />
        </div>
      </div>

        {/* DECK B */}
        <div style={styles.deck}>
          <div style={styles.deckHeader}>
            <h3 style={styles.deckTitle}>DECK B</h3>
          </div>
          
          {/* <TrackDisplay onTrackLoaded={handleTrackLoadedB} deck="B" /> */}
          <TrackDisplay 
          onTrackLoaded={handleTrackLoadedB} 
          deck="B" 
          fadeDuration={fadeDuration} // Add this prop
        />
          <div style={styles.deckControls}>
            <JogWheel />
            
            <div style={styles.eqSection}>
              <Knob label="HIGH" />
              <Knob label="MID" />
              <Knob label="LOW" />
            </div>
            
            <div style={styles.volumeSection}>
              <SyncButton />
              <VolumeSlider audioRef={deckB} side="right" />
            </div>
          </div>
          
          {deckB && <AudioEffects audioRef={deckB} />}
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
    maxWidth: "1200px",
    margin: "auto",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
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
  decksContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
  },
  deck: {
    flex: "1",
    backgroundColor: "#222",
    borderRadius: "8px",
    padding: "15px",
    border: "1px solid #444",
  },
  deckHeader: {
    borderBottom: "1px solid #444",
    marginBottom: "15px",
    paddingBottom: "5px",
  },
  deckTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "bold",
    color: "#00c3ff",
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
  },
  crossfader: {
    width: "150px",
    margin: "15px 0",
    WebkitAppearance: "none",
    height: "6px",
    borderRadius: "3px",
    background: "linear-gradient(to right, #00c3ff, #ff0084)",
    outline: "none",
    transform: "rotate(270deg)",
    accentColor: "#fff",
    cursor: "pointer",
    transition: "background 0.3s ease",
    '&:hover': {
      height: "8px",
    }
  },
  crossfaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#333",
    padding: "15px 5px",
    borderRadius: "8px",
    border: "1px solid #444",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
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
  fadeDurationControl: {
    backgroundColor: '#2a2a2a',
    padding: '10px',
    borderRadius: '8px',
    marginTop: '15px',
    border: '1px solid #444',
  },
  sliderLabel: {
    color: '#aaa',
    fontSize: '12px',
    marginBottom: '5px',
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    accentColor: '#00c3ff',
  },
  fadeControl: {
    backgroundColor: '#2a2a2a',
    padding: '10px',
    borderRadius: '8px',
    marginTop: '15px',
    border: '1px solid #444',
  },
  fadeLabel: {
    color: '#aaa',
    fontSize: '12px',
    display: 'block',
    marginBottom: '5px',
    textAlign: 'center',
  },
  fadeSlider: {
    width: '100%',
    accentColor: '#00c3ff',
  },
};

export default DJController;