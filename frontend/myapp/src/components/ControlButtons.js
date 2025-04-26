import React, { useState, useEffect } from "react";
import useCrossfadeAudio from "./useCrossfadeAudio";
import TempoSlider from "./TempoSlider";
import AudioEffects from "./AudioEffects";

const ControlButtons = ({ audioRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [cuePoints, setCuePoints] = useState([]);
  const [fadeDuration, setFadeDuration] = useState(1); // Default 1 second
  const [selectedCue, setSelectedCue] = useState(null);
  const [showEffects, setShowEffects] = useState(false);
  const { crossfadeTo } = useCrossfadeAudio(audioRef, fadeDuration);
  const [currentTime, setCurrentTime] = useState(0);

  // Add this new state for the crossfade slider visibility
  const [showCrossfadeControls, setShowCrossfadeControls] = useState(false);
  useEffect(() => {
    if (!audioRef?.current) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audioRef.current.currentTime);
    };

    const handlePlayState = () => {
      setIsPlaying(!audioRef.current.paused);
    };

    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('play', handlePlayState);
    audioRef.current.addEventListener('pause', handlePlayState);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('play', handlePlayState);
        audioRef.current.removeEventListener('pause', handlePlayState);
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

  const setCuePointHandler = () => {
    if (audioRef.current) {
      // Set cue point at current position
      setCuePoint(audioRef.current.currentTime);
    }
  };



  const addCuePoint = () => {
    if (audioRef.current) {
      const newCue = {
        label: `CUE ${cuePoints.length + 1}`,
        time: audioRef.current.currentTime,
      };
      setCuePoints([...cuePoints, newCue]);
      setSelectedCue(cuePoints.length);
    }
  };

  // Update the goToCuePoint function in ControlButtons.js
  const goToCuePoint = (time, index) => {
    if (audioRef.current) {
      // Use crossfade instead of direct jump
      crossfadeTo(time);
      setSelectedCue(index);

      // Ensure playback continues if it was playing
      if (!audioRef.current.paused) {
        audioRef.current.play().catch(e => console.error("Playback error:", e));
      }
    }
  };

  // Update the jumpToCuePoint function
  const jumpToCuePoint = () => {
    if (audioRef.current && cuePoint !== null) {
      crossfadeTo(cuePoint);
    }
  };


  const removeCuePoint = (index) => {
    const updatedCues = cuePoints.filter((_, i) => i !== index);
    setCuePoints(updatedCues);
    if (selectedCue === index) {
      setSelectedCue(null);
    }
  };

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={styles.controlPanel}>
      {/* Transport Controls */}
      <div style={styles.transportControls}>
        <button style={styles.playButton} onClick={handlePlayPause}>
          {isPlaying ? "⏸" : "▶"}
        </button>

        <div style={styles.cueControls}>
          {/* Set cue button */}
          <button
            style={{
              ...styles.cueButton,
              backgroundColor: cuePoint !== null ? '#FF5500' : '#333'
            }}
            onClick={setCuePointHandler}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <circle cx="12" cy="12" r="5" />
            </svg>
            <span>SET CUE</span>
          </button>

          {/* Jump to cue button */}
          <button
            style={{
              ...styles.cueButton,
              opacity: cuePoint !== null ? 1 : 0.5,
              cursor: cuePoint !== null ? 'pointer' : 'not-allowed',
            }}
            onClick={jumpToCuePoint}
            disabled={cuePoint === null}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
            </svg>
            <span>CUE JUMP</span>
          </button>

          {/* Add to cue list button */}
          {/* Add Cue Button with + icon */}
          <button
            style={styles.addCueButton}
            onClick={addCuePoint}
            title="Add Cue Point"
          >
            <div style={styles.plusIcon}>+</div>
            <span style={styles.addCueText}>CUE</span>
          </button>

          {/* Crossfade Toggle Button */}
          <button
            style={{
              ...styles.crossfadeToggle,
              backgroundColor: showCrossfadeControls ? '#00c3ff' : '#333'
            }}
            onClick={() => setShowCrossfadeControls(!showCrossfadeControls)}
            title="Crossfade Settings"
          >
            FADE
          </button>

        </div>

        <div style={styles.currentTime}>
          {formatTime(currentTime)}
        </div>


        <button
          style={{
            ...styles.fxButton,
            background: showEffects ? 'linear-gradient(45deg, #FF5500, #FF8800)' : '#333'
          }}
          onClick={() => setShowEffects(!showEffects)}
        >
          FX
        </button>
      </div>

      {/* Cue Point Bar */}
      {cuePoints.length > 0 && (
        <div style={styles.cuePointBar}>
          {cuePoints.map((cue, index) => (
            <div key={index} style={styles.cuePointItem}>
              <button
                onClick={() => goToCuePoint(cue.time, index)}
                style={{
                  ...styles.cuePointButton,
                  backgroundColor: selectedCue === index ? '#FF5500' : '#333',
                }}
              >
                {cue.label} [{formatTime(cue.time)}]
              </button>
              <button
                onClick={() => removeCuePoint(index)}
                style={styles.deleteButton}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Crossfade Controls - shown when toggled */}
      {showCrossfadeControls && (
        <div style={styles.crossfadeControls}>
          <div style={styles.crossfadeSliderContainer}>
            <span style={styles.sliderLabel}>
              Crossfade: {fadeDuration.toFixed(1)}s
            </span>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={fadeDuration}
              onChange={(e) => setFadeDuration(parseFloat(e.target.value))}
              style={styles.crossfadeSlider}
            />
          </div>
        </div>
      )}

      {/* Slider Controls */}
      <div style={styles.sliderControls}>
        <div style={styles.fadeControl}>
          <span style={styles.sliderLabel}>FADE: {fadeDuration.toFixed(1)}s</span>
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
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#252525',
    borderTop: '1px solid #333',
    padding: '16px',
    gap: '12px',
  },
  transportControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  playButton: {
    backgroundColor: '#333',
    color: 'white',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  cueControls: {
    display: 'flex',
    gap: '8px',
  },
  cueButton: {
    backgroundColor: '#333',
    color: 'white',
    height: '34px',
    padding: '0 12px',
    borderRadius: '17px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: 'bold',
    fontSize: '12px',
  },
  currentTime: {
    color: 'white',
    fontSize: '14px',
    fontFamily: 'monospace',
    backgroundColor: '#333',
    padding: '4px 8px',
    borderRadius: '4px',
    marginLeft: 'auto',
  },
  fxButton: {
    backgroundColor: '#333',
    color: 'white',
    height: '40px',
    width: '40px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
  },
  cuePointBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#1a1a1a',
    borderRadius: '4px',
  },
  cuePointItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  cuePointButton: {
    backgroundColor: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  deleteButton: {
    backgroundColor: '#ff3333',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    cursor: 'pointer',
    padding: 0,
  },
  sliderControls: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },
  fadeControl: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  sliderLabel: {
    color: '#999',
    fontSize: '12px',
    marginBottom: '4px',
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    accentColor: '#FF5500',
  },
  addCueButton: {
    backgroundColor: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#00c3ff',
    }
  },
  plusIcon: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginRight: '5px',
  },
  addCueText: {
    fontSize: '12px',
    fontWeight: 'bold',
  },
  crossfadeToggle: {
    backgroundColor: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  crossfadeControls: {
    backgroundColor: '#2a2a2a',
    padding: '10px',
    borderRadius: '8px',
    marginTop: '10px',
    border: '1px solid #444',
  },
  crossfadeSliderContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  crossfadeSlider: {
    width: '100%',
    accentColor: '#00c3ff',
  },
  sliderLabel: {
    color: '#aaa',
    fontSize: '12px',
    fontWeight: 'bold',
  },
};

export default ControlButtons;