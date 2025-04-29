import React, { useRef } from "react";

const TrackPlayback = ({
  fileName,
  formatTime,
  currentTime,
  duration,
  isPlaying,
  isCrossfading,
  cuePoints,
  selectedCue,
  audioRef,
  audioSrc,
  togglePlay,
  addCuePoint,
  jumpToCuePoint,
  setShowAddSong,
  handleTimeUpdate,
  handleMetadataLoaded,
}) => {
  const progressBarRef = useRef(null);

  // Handle click on progress bar to jump to position
  const handleProgressBarClick = (e) => {
    if (!audioRef.current || !progressBarRef.current || !duration) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const progressBarWidth = rect.width;

    // Calculate the corresponding time in the track
    const clickRatio = clickPosition / progressBarWidth;
    const seekTime = clickRatio * duration;

    // Update the current time directly first (for immediate feedback)
    audioRef.current.currentTime = seekTime;

    // Use the crossfade functionality to smooth the transition
    const originalVolume = audioRef.current.volume;
    const steps = 10;
    const stepSize = originalVolume / steps;
    const fadeDuration = 1; // Default fade duration

    // Fade out and in for smoother transition
    const fadeOutInterval = setInterval(() => {
      if (audioRef.current.volume > 0.05) {
        audioRef.current.volume -= stepSize;
      } else {
        clearInterval(fadeOutInterval);

        // Fade in
        const fadeInInterval = setInterval(() => {
          if (audioRef.current.volume < originalVolume) {
            audioRef.current.volume += stepSize;
          } else {
            clearInterval(fadeInInterval);
            audioRef.current.volume = originalVolume;
          }
        }, ((fadeDuration / 2) * 1000) / steps); // Slightly faster fade-in
      }
    }, ((fadeDuration / 2) * 1000) / steps); // Slightly faster fade-out

    if (!isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        // Optionally provide feedback to the user here
      });
    }
  };

  return (
    <>
      <div style={styles.trackInfo}>
        <h4 style={styles.trackName}>{fileName}</h4>
        <div style={styles.timeInfo}>
          <span>{formatTime(currentTime)}</span>
          <span style={styles.duration}>{formatTime(duration)}</span>
        </div>
      </div>

      <div style={styles.waveform}>
        <div
          ref={progressBarRef}
          style={styles.progressBar}
          onClick={handleProgressBarClick}
          data-testid="progress-bar"
        >
          <div
            style={{
              ...styles.progress,
              width: `${(currentTime / duration) * 100}%`,
              opacity: isCrossfading ? 0.7 : 1,
            }}
            data-testid="progress-indicator"
          ></div>
          <div
            style={{
              ...styles.crossfadeOverlay,
              opacity: isCrossfading ? 0.5 : 0,
            }}
            data-testid="crossfade-overlay"
          ></div>
          {cuePoints.map((cue, index) => (
            <div
              key={cue.id}
              data-testid={`cue-marker-${index}`}
              style={{
                ...styles.cueMarker,
                ...(selectedCue === index && styles.activeCueMarker),
                ...(selectedCue === index &&
                  isCrossfading &&
                  styles.crossfadingCueMarker),
                left: `${(cue.time / duration) * 100}%`,
              }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering progressBar click
                jumpToCuePoint(cue.time, index);
              }}
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
              boxShadow: isPlaying ? "0 0 10px rgba(0, 195, 255, 0.5)" : "none",
            }}
            onClick={togglePlay}
            data-testid="play-button"
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
          <button
            style={styles.cueButton}
            onClick={addCuePoint}
            data-testid="cue-button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </button>
        </div>
        <button
          style={styles.loadButton}
          onClick={() => setShowAddSong(true)}
          data-testid="load-button"
        >
          LOAD
        </button>
      </div>

      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleMetadataLoaded}
        onEnded={() => {}}
        data-testid="audio-element"
      />
    </>
  );
};

const styles = {
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
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  progress: {
    height: "100%",
    background: "linear-gradient(90deg, #00c3ff30, #00c3ff80)",
    width: "0%", // Default value
    opacity: 1,
    transition: "width 0.1s linear, opacity 0.3s ease",
    pointerEvents: "none",
  },
  crossfadeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 136, 0, 0.3)",
    opacity: 0,
    transition: "opacity 0.3s ease",
    pointerEvents: "none",
  },
  cueMarker: {
    position: "absolute",
    top: 0,
    width: "3px",
    height: "100%",
    cursor: "pointer",
    zIndex: 2,
    transition: "all 0.3s ease",
    backgroundColor: "#00c3ff",
  },
  activeCueMarker: {
    backgroundColor: "#FF5500",
    transform: "scaleX(1.5)",
    boxShadow: "0 0 10px rgba(255, 85, 0, 0.7)",
  },
  crossfadingCueMarker: {
    backgroundColor: "#FF8800",
    transform: "scaleX(2)",
    boxShadow: "0 0 15px rgba(255, 136, 0, 0.9)",
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
};

export default TrackPlayback;
