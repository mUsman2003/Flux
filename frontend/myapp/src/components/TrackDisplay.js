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
  const [cuePoints, setCuePoints] = useState([]);
  const [selectedCue, setSelectedCue] = useState(null);
  const cueListRef = useRef(null);

  // Handle file selection from the modal
  const handleSelectFile = (file) => {
    const objectUrl = URL.createObjectURL(file);
    setFileName(file.name);
    setAudioSrc(objectUrl);
    setCuePoints([]); // Clear cues when new track loads

    if (audioSrc) {
      URL.revokeObjectURL(audioSrc);
    }

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            onTrackLoaded({
              audioRef,
              deck,
              fileName: file.name,
              audioSrc: objectUrl,
            });
          })
          .catch((error) => {
            console.error("Error playing audio:", error);
          });
      }
    }, 100);
  };

  // Handle selection from the database
  const handleSelectDatabaseSong = (song) => {
    setFileName(song.name);
    setAudioSrc(song.url);
    setCuePoints([]); // Clear cues when new track loads

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            onTrackLoaded({
              audioRef,
              deck,
              fileName: song.name,
              audioSrc: song.url,
            });
          })
          .catch((error) => {
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

  // Add cue point at current position
  const addCuePoint = () => {
    if (audioRef.current) {
      const newCue = {
        id: Date.now(),
        time: audioRef.current.currentTime,
        label: `CUE ${cuePoints.length + 1}`,
      };
      setCuePoints([...cuePoints, newCue]);
      setSelectedCue(cuePoints.length);

      // Scroll to the new cue point
      setTimeout(() => {
        if (cueListRef.current) {
          cueListRef.current.scrollLeft = cueListRef.current.scrollWidth;
        }
      }, 10);
    }
  };

  // Jump to specific cue point
  const jumpToCuePoint = (time, index) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setSelectedCue(index);
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true));
      }
    }
  };

  // Remove cue point
  const removeCuePoint = (id, event) => {
    // Prevent the click from bubbling up to the cue item
    event.stopPropagation();
    setCuePoints(cuePoints.filter((cue) => cue.id !== id));
    if (selectedCue !== null && cuePoints[selectedCue]?.id === id) {
      setSelectedCue(null);
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
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
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
                  width: `${(currentTime / duration) * 100}%`,
                }}
              ></div>
              {/* Cue point markers */}
              {cuePoints.map((cue, index) => (
                <div
                  key={cue.id}
                  style={{
                    ...styles.cueMarker,
                    left: `${(cue.time / duration) * 100}%`,
                    backgroundColor:
                      selectedCue === index ? "#FF5500" : "#00c3ff",
                  }}
                  onClick={() => jumpToCuePoint(cue.time, index)}
                />
              ))}
            </div>
          </div>

          <div style={styles.controls}>
            <div style={styles.playbackControls}>
              <button
                style={{
                  ...styles.playButton,
                  backgroundColor: isPlaying ? "#00c3ff" : "#333",
                  boxShadow: isPlaying
                    ? "0 0 10px rgba(0, 195, 255, 0.5)"
                    : "none",
                }}
                onClick={togglePlay}
              >
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
              <button style={styles.cueButton} onClick={addCuePoint}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </button>
            </div>
            <button
              style={styles.loadButton}
              onClick={() => setShowAddSong(true)}
            >
              LOAD
            </button>
          </div>

          {/* Horizontal scrollable cue list */}
          {cuePoints.length > 0 && (
            <div style={styles.cueListWrapper}>
              <div ref={cueListRef} style={styles.cueListContainer}>
                {cuePoints.map((cue, index) => (
                  <div
                    key={cue.id}
                    style={{
                      ...styles.cueItem,
                      backgroundColor:
                        selectedCue === index ? "#FF5500" : "#333",
                    }}
                    onClick={() => jumpToCuePoint(cue.time, index)}
                  >
                    <span style={styles.cueLabel}>
                      {cue.label} [{formatTime(cue.time)}]
                    </span>
                    <button
                      style={styles.deleteCueButton}
                      onClick={(e) => removeCuePoint(cue.id, e)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
    minHeight: "150px",
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
    marginBottom: "10px",
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
  cueMarker: {
    position: "absolute",
    top: 0,
    width: "3px",
    height: "100%",
    cursor: "pointer",
    zIndex: 2,
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
  },
  playbackControls: {
    display: "flex",
    gap: "8px",
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
    transition: "all 0.2s ease",
  },
  cueButton: {
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
    transition: "all 0.2s ease",
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
    transition: "all 0.2s ease",
  },

  cueListWrapper: {
    width: "100%",
    marginTop: "15px",
    padding: "5px 0",
    borderTop: "1px solid #444",
  },

  cueListContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap", // <== Important fix!
    overflowX: "auto",
    overflowY: "hidden",
    scrollbarWidth: "thin",
    scrollbarColor: "#555 #222",
    gap: "10px",
    padding: "10px 0",
    maxWidth: "500px",
    whiteSpace: "nowrap",
  },

  cueItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#333",
    borderRadius: "4px",
    padding: "8px 12px",
    cursor: "pointer",
    minWidth: "90px",
    maxWidth: "150px",
    flexShrink: 0, // Prevents shrinking ✅
    transition: "all 0.2s ease",
  },

  cueLabel: {
    fontSize: "12px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },

  deleteCueButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    padding: "0 4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  },
};

export default TrackDisplay;
