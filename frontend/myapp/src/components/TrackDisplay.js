import React, { useState, useRef } from "react";
import AddSongModal from "./AddSongModal";
import TrackPlayback from "./TrackPlayback";
import CuePointsManager from "./CuePointsManager";

const TrackDisplay = ({ onTrackLoaded, deck, fadeDuration = 1 }) => {
  const [showAddSong, setShowAddSong] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [audioSrc, setAudioSrc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [cuePoints, setCuePoints] = useState([]);
  const [selectedCue, setSelectedCue] = useState(null);
  const [isCrossfading, setIsCrossfading] = useState(false);
  
  const audioRef = useRef(null);
  
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
    }
  };

  // Jump to cue point with crossfade
  const jumpToCuePoint = (time, index) => {
    if (audioRef.current) {
      setIsCrossfading(true);
      const originalVolume = audioRef.current.volume;
      const steps = 10; // Number of fade steps
      const stepSize = originalVolume / steps;
      
      // Fade out
      const fadeOutInterval = setInterval(() => {
        if (audioRef.current.volume > 0.05) {
          audioRef.current.volume -= stepSize;
        } else {
          clearInterval(fadeOutInterval);
          audioRef.current.currentTime = time;
          
          // Fade in
          const fadeInInterval = setInterval(() => {
            if (audioRef.current.volume < originalVolume) {
              audioRef.current.volume += stepSize;
            } else {
              clearInterval(fadeInInterval);
              audioRef.current.volume = originalVolume;
              setIsCrossfading(false);
            }
          }, (fadeDuration * 1000) / steps);
        }
      }, (fadeDuration * 1000) / steps);
      
      setSelectedCue(index);
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true));
      }
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

  if (!fileName) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyText}>No Track Loaded</div>
          <button
            style={styles.loadEmptyButton}
            onClick={() => setShowAddSong(true)}
          >
            LOAD TRACK
          </button>
        </div>
        
        {showAddSong && (
          <AddSongModal
            onClose={() => setShowAddSong(false)}
            onSelectFile={handleSelectFile}
            onSelectDatabaseSong={handleSelectDatabaseSong}
          />
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <TrackPlayback
        fileName={fileName}
        formatTime={formatTime}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        isCrossfading={isCrossfading}
        cuePoints={cuePoints}
        selectedCue={selectedCue}
        audioRef={audioRef}
        audioSrc={audioSrc}
        togglePlay={togglePlay}
        addCuePoint={addCuePoint}
        jumpToCuePoint={jumpToCuePoint}
        setShowAddSong={setShowAddSong}
        handleTimeUpdate={handleTimeUpdate}
        handleMetadataLoaded={handleMetadataLoaded}
      />

      {cuePoints.length > 0 && (
        <CuePointsManager
          cuePoints={cuePoints}
          selectedCue={selectedCue}
          jumpToCuePoint={jumpToCuePoint}
          setCuePoints={setCuePoints}
          setSelectedCue={setSelectedCue}
          formatTime={formatTime}
        />
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