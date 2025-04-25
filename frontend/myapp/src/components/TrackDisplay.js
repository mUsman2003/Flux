import React, { useState, useRef } from "react";
import AddSongModal from "./AddSongModal";

const TrackDisplay = ({ onTrackLoaded, deck }) => {
  const [showAddSong, setShowAddSong] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [audioSrc, setAudioSrc] = useState(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Handle file selection from the modal
  const handleSelectFile = (file) => {
    const objectUrl = URL.createObjectURL(file);
    setFileName(file.name);
    setAudioSrc(objectUrl);
    
    // If we already have an audio element, clean up the old object URL
    if (audioSrc) {
      URL.revokeObjectURL(audioSrc);
    }
    
    // Set a short timeout to ensure the audio element is updated with the new source
    setTimeout(() => {
      if (audioRef.current) {
        // Start playing immediately when a file is loaded
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          // Notify parent component that track is loaded and playing
          onTrackLoaded({ audioRef, deck, fileName: file.name, audioSrc: objectUrl });
        }).catch(error => {
          console.error("Error playing audio:", error);
        });
      }
    }, 100);
  };

  // Handle selection from the database
  const handleSelectDatabaseSong = (song) => {
    setFileName(song.name);
    setAudioSrc(song.url);
    
    // Set a short timeout to ensure the audio element is updated with the new source
    setTimeout(() => {
      if (audioRef.current) {
        // Start playing immediately when a track is selected
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          // Notify parent component that track is loaded and playing
          onTrackLoaded({ audioRef, deck, fileName: song.name, audioSrc: song.url });
        }).catch(error => {
          console.error("Error playing audio:", error);
        });
      }
    }, 100);
  };

  // Handle play/pause toggle
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle metadata loaded (to get duration)
  const handleMetadataLoaded = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Format time (seconds) to MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div style={styles.container}>
      {fileName ? (
        <>
          <div style={styles.trackInfo}>
            <h4 style={styles.trackName}>{fileName}</h4>
            <div style={styles.timeInfo}>
              <span>{formatTime(currentTime)}</span>
              <span style={styles.duration}>{formatTime(duration)}</span>
            </div>
          </div>

          <div style={styles.waveform}>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progress,
                  width: `${(currentTime / duration) * 100}%`
                }}
              ></div>
            </div>
          </div>

          <div style={styles.controls}>
            <button style={styles.playButton} onClick={togglePlay}>
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button 
              style={styles.loadButton} 
              onClick={() => setShowAddSong(true)}
            >
              LOAD
            </button>
          </div>

          <audio
            ref={audioRef}
            src={audioSrc}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleMetadataLoaded}
            onEnded={() => setIsPlaying(false)}
          />
        </>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyText}>No Track Loaded</div>
          <button 
            style={styles.loadEmptyButton}
            onClick={() => setShowAddSong(true)}
          >
            LOAD TRACK
          </button>
        </div>
      )}

      {showAddSong && (
        <AddSongModal
          onClose={() => setShowAddSong(false)}
          onSelectFile={handleSelectFile}
          onSelectDatabaseSong={handleSelectDatabaseSong}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#2a2a2a",
    borderRadius: "6px",
    padding: "15px",
    height: "150px",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #444",
  },
  trackInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  trackName: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "500",
    color: "#00c3ff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "70%",
  },
  timeInfo: {
    display: "flex",
    gap: "10px",
    fontSize: "12px",
    color: "#aaa",
    fontFamily: "monospace",
  },
  duration: {
    color: "#666",
  },
  waveform: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    width: "100%",
    height: "40px",
    backgroundColor: "#222",
    borderRadius: "4px",
    overflow: "hidden",
    border: "1px solid #333",
    position: "relative",
  },
  progress: {
    height: "100%",
    background: "linear-gradient(90deg, #00c3ff30, #00c3ff80)",
    transition: "width 0.1s linear",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
  },
  playButton: {
    backgroundColor: "#333",
    color: "white",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  loadButton: {
    backgroundColor: "#333",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "8px 16px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
  },
  emptyText: {
    color: "#777",
    fontSize: "16px",
    fontStyle: "italic",
  },
  loadEmptyButton: {
    backgroundColor: "#00c3ff",
    color: "#111",
    border: "none",
    borderRadius: "6px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s ease",
  }
};

export default TrackDisplay;