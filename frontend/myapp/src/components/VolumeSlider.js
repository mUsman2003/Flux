import React from 'react';

const VolumeSlider = ({ audioRef }) => {
  const handleVolumeChange = (e) => {
    const volume = e.target.value / 100;
    if (audioRef.current) {
      audioRef.current.volume = volume;
      console.log('Volume changed to:', volume);  // Debugging
    } else {
      console.log('audioRef.current is null');
    }
  };

  return (
    <div style={styles.container}>
      <input
        type="range"
        min="0"
        max="100"
        defaultValue="100"
        onChange={handleVolumeChange}
        style={styles.slider}
      />
      <p>Volume</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  slider: {
    width: '60px',
  },
};

export default VolumeSlider;
