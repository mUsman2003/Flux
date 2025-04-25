import React, { useState, useEffect } from "react";
import useCrossfadeAudio from "./useCrossfadeAudio";
import TempoSlider from "./TempoSlider";
import AudioEffects from "./AudioEffects";

const ControlButtons = ({ audioRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [cuePoints, setCuePoints] = useState([]);
  const [fadeDuration, setFadeDuration] = useState(1);
  const [selectedCue, setSelectedCue] = useState(null);
  const [showEffects, setShowEffects] = useState(true);
  const { crossfadeTo } = useCrossfadeAudio(audioRef, fadeDuration);
  const [currentTime, setCurrentTime] = useState(0);

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

  const goToCuePoint = (time, index) => {
    crossfadeTo(time);
    setSelectedCue(index);
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
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        
        <button style={styles.cueButton} onClick={addCuePoint}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <circle cx="12" cy="12" r="5"/>
          </svg>
          <span>CUE</span>
        </button>
        
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
                {cue.label}
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
      {showEffects && <AudioEffects audioRef={audioRef} />}
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
  cueButton: {
    backgroundColor: '#333',
    color: 'white',
    height: '40px',
    padding: '0 16px',
    borderRadius: '20px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontWeight: 'bold',
    fontSize: '14px',
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
};

export default ControlButtons;