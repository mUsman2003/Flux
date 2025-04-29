import React, { useState, useEffect } from "react";
import useCrossfadeAudio from "./useCrossfadeAudio";
import TempoSlider from "./TempoSlider";
import AudioEffects from "./AudioEffects";
import CuePointsManager from "./CuePointsManager";
import CrossfadeControls from "./CrossfadeControls";

const ControlButtons = ({ audioRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [cuePoints, setCuePoints] = useState([]);
  const [fadeDuration, setFadeDuration] = useState(1); // Default 1 second
  const [selectedCue, setSelectedCue] = useState(null);
  const [showEffects, setShowEffects] = useState(false);
  const { crossfadeTo } = useCrossfadeAudio(audioRef, fadeDuration);
  const [currentTime, setCurrentTime] = useState(0);
  const [showCrossfadeControls, setShowCrossfadeControls] = useState(false);

  useEffect(() => {
    if (!audioRef?.current) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audioRef.current.currentTime);
    };

    const handlePlayState = () => {
      setIsPlaying(!audioRef.current.paused);
    };

    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    audioRef.current.addEventListener("play", handlePlayState);
    audioRef.current.addEventListener("pause", handlePlayState);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.removeEventListener("play", handlePlayState);
        audioRef.current.removeEventListener("pause", handlePlayState);
      }
    };
  }, [audioRef]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div style={styles.controlPanel}>
      {/* Transport Controls */}
      <div style={styles.transportControls}>
        <button
          style={styles.playButton}
          onClick={handlePlayPause}
          data-testid="play-button"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        <CuePointsManager
          audioRef={audioRef}
          cuePoints={cuePoints}
          setCuePoints={setCuePoints}
          selectedCue={selectedCue}
          setSelectedCue={setSelectedCue}
          crossfadeTo={crossfadeTo}
          formatTime={formatTime}
          setShowCrossfadeControls={setShowCrossfadeControls}
          showCrossfadeControls={showCrossfadeControls}
        />

        <div style={styles.currentTime}>{formatTime(currentTime)}</div>

        <button
          style={{
            ...styles.fxButton,
            background: showEffects
              ? "linear-gradient(45deg, #FF5500, #FF8800)"
              : "#333",
          }}
          onClick={() => setShowEffects(!showEffects)}
        >
          FX
        </button>
      </div>

      {/* Crossfade Controls - shown when toggled */}
      {showCrossfadeControls && (
        <CrossfadeControls
          fadeDuration={fadeDuration}
          setFadeDuration={setFadeDuration}
        />
      )}

      {/* Slider Controls */}
      <div style={styles.sliderControls}>
        <div style={styles.fadeControl}>
          <span style={styles.sliderLabel}>
            FADE: {fadeDuration.toFixed(1)}s
          </span>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={fadeDuration}
            onChange={(e) => setFadeDuration(parseFloat(e.target.value))}
            style={styles.slider}
          />
        </div>

        <TempoSlider audioRef={audioRef} />
      </div>

      {/* Effects Panel */}
      {showEffects && audioRef && <AudioEffects audioRef={audioRef} />}
    </div>
  );
};

const styles = {
  controlPanel: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#252525",
    borderTop: "1px solid #333",
    padding: "16px",
    gap: "12px",
  },
  transportControls: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  playButton: {
    backgroundColor: "#333",
    color: "white",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  currentTime: {
    color: "white",
    fontSize: "14px",
    fontFamily: "monospace",
    backgroundColor: "#333",
    padding: "4px 8px",
    borderRadius: "4px",
    marginLeft: "auto",
  },
  fxButton: {
    backgroundColor: "#333",
    color: "white",
    height: "40px",
    width: "40px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
  },
  sliderControls: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },
  fadeControl: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  sliderLabel: {
    color: "#999",
    fontSize: "12px",
    marginBottom: "4px",
    fontWeight: "bold",
  },
  slider: {
    width: "100%",
    accentColor: "#FF5500",
  },
};

export default ControlButtons;
