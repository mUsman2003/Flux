import React, { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';

const Player = () => {
  const [musicFiles, setMusicFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const soundRef = useRef(null);

  // Fetch music files from the backend
  useEffect(() => {
    fetch('/api/music')
      .then((response) => response.json())
      .then((data) => setMusicFiles(data))
      .catch((error) => console.error('Error fetching music files:', error));
  }, []);

  // Handle play/pause/stop functionality
  const playMusic = () => {
    if (selectedFile) {
      if (soundRef.current) {
        soundRef.current.stop();
      }
      soundRef.current = new Howl({
        src: [`/music/${selectedFile}`],
        volume: volume,
        onplay: () => setIsPlaying(true),
        onpause: () => setIsPlaying(false),
        onstop: () => setIsPlaying(false),
      });
      soundRef.current.play();
    }
  };

  const pauseMusic = () => {
    if (soundRef.current) {
      soundRef.current.pause();
    }
  };

  const stopMusic = () => {
    if (soundRef.current) {
      soundRef.current.stop();
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (soundRef.current) {
      soundRef.current.volume(newVolume);
    }
  };

  return (
    <div>
      <select onChange={(e) => setSelectedFile(e.target.value)}>
        <option value="">Select a track</option>
        {musicFiles.map((file, index) => (
          <option key={index} value={file}>
            {file}
          </option>
        ))}
      </select>
      <div>
        <button onClick={playMusic} disabled={!selectedFile || isPlaying}>
          Play
        </button>
        <button onClick={pauseMusic} disabled={!isPlaying}>
          Pause
        </button>
        <button onClick={stopMusic} disabled={!isPlaying}>
          Stop
        </button>
      </div>
      <div className="volume-control">
        <label>Volume:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>
    </div>
  );
};

export default Player;