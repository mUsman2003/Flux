import React, { useState, useEffect } from 'react';

const VolumeSlider = ({ audioRef, side = "left" }) => {
  const [originalVolume, setOriginalVolume] = useState(1);
  const [volume, setVolume] = useState(20);
  
  useEffect(() => {
    if (audioRef?.current) {
      // Preserve original volume but force initial volume to 20%
      setOriginalVolume(audioRef.current.volume);
      audioRef.current.volume = (20 / 100) * audioRef.current.volume;
    }
  }, [audioRef]);
  
  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    
    if (audioRef?.current) {
      audioRef.current.volume = (newVolume / 100) * originalVolume;
    }
  };

  // Color theme based on side (left/right for deck A/B)
  const accentColor = side === "left" ? "#4095e5" : "#e5405e";
  
  return (
    <div style={styles.container}>
      <div style={styles.volumeContainer}>
        <div style={styles.faderBackground}>
          <div 
            style={{
              ...styles.faderFill,
              height: `${volume}%`,
              backgroundColor: accentColor
            }}
          ></div>
        </div>
        <input
          type="range"
          min="0"
          max="90"
          value={volume}
          onChange={handleVolumeChange}
          style={styles.slider}
          orient="vertical"
        />
      </div>
      <div style={styles.label}>VOL</div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '150px',
    marginTop: '15px',
  },
  volumeContainer: {
    position: 'relative',
    height: '120px',
    width: '40px',
    display: 'flex',
    justifyContent: 'center',
  },
  faderBackground: {
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    height: '100%',
    width: '6px',
    backgroundColor: '#151515',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  faderFill: {
    position: 'absolute',
    bottom: '0',
    width: '100%',
    backgroundColor: '#4095e5',
    transition: 'height 0.1s ease',
  },
  slider: {
    WebkitAppearance: 'slider-vertical',
    width: '30px',
    height: '120px',
    background: 'transparent',
    cursor: 'pointer',
    zIndex: '1',
  },
  label: {
    marginTop: '5px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: '1px',
  }
};

export default VolumeSlider;