// Modified TrackDisplay.js to fix the issue of songs restarting in the other deck

import React, { useState, useRef, useEffect } from "react";
import AddSongModal from "./AddSongModal";
import TrackPlayback from "./TrackPlayback";
import CuePointsManager from "./CuePointsManager";
import useCrossfadeAudio from "./useCrossfadeAudio";

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
  const [isInitialized, setIsInitialized] = useState(false); // Track if deck is initialized

  const audioRef = useRef(null);
  const { crossfadeTo } = useCrossfadeAudio(audioRef, fadeDuration);

  // Handle file selection from the modal
  const handleSelectFile = (file) => {
    const objectUrl = URL.createObjectURL(file);
    setFileName(file.name);
    setAudioSrc(objectUrl);
    console.log(objectUrl);

    setCuePoints([]); // Clear cues when new track loads

    if (audioSrc) {
      URL.revokeObjectURL(audioSrc);
    }
  };

  // Handle selection from the database - using object URL like file handling
  const handleSelectDatabaseSong = async (song) => {
    try {
      // Validate song data
      if (!song?.path) {
        throw new Error("No valid song path provided");
      }

      console.log("Loading song from:", song.path);

      // First fetch the audio file from the backend
      const response = await fetch(
        `http://localhost:5000/api/songs/${song.id}/file`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }

      // Convert to blob and create object URL
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      // Set state (same as file handling)
      setFileName(song.name);
      setAudioSrc(objectUrl);
      setCuePoints([]);

      // Clean up previous URL if exists
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }

      // Initialize audio element
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      // Set up audio element
      audioRef.current.src = objectUrl;
      audioRef.current.load();

      // Event listeners
      audioRef.current.oncanplaythrough = () => {
        console.log("Audio ready:", song.name);
        onTrackLoaded({
          audioRef,
          deck,
          fileName: song.name,
          audioSrc: objectUrl,
        });
      };

      audioRef.current.onerror = (e) => {
        console.error("Audio load error:", e);
        setFileName(`Error: ${song.name}`);
        setAudioSrc(null);
      };
    } catch (error) {
      console.error("Error loading database song:", error);
      setFileName(`Failed: ${song.name}`);
      setAudioSrc(null);
    }
  };

  // Effect to manage audio loading and notification to parent
  useEffect(() => {
    if (audioSrc && audioRef.current) {
      // Set the source if it's not already set correctly
      if (audioRef.current.src !== audioSrc) {
        audioRef.current.src = audioSrc;
        // Load the audio
        audioRef.current.load();
      }

      // Wait for it to be ready
      audioRef.current.oncanplaythrough = () => {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsInitialized(true); // Mark deck as initialized

            // Notify parent component that track is loaded and ready
            onTrackLoaded({
              audioRef,
              deck,
              fileName: fileName,
              audioSrc: audioSrc,
              isInitial: !isInitialized, // Flag indicating if this is first load
            });
          })
          .catch((error) => {
            console.error("Error playing audio:", error);
          });
      };
    }
  }, [audioSrc, fileName, deck, onTrackLoaded, isInitialized]);

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
      crossfadeTo(time);
      setSelectedCue(index);

      // Ensure playback continues if it was playing
      if (!isPlaying) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((e) => console.error("Play error:", e))
          .finally(() => setIsCrossfading(false));
      } else {
        setTimeout(() => setIsCrossfading(false), fadeDuration * 1000);
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
          audioRef={audioRef}
          cuePoints={cuePoints}
          setCuePoints={setCuePoints}
          selectedCue={selectedCue}
          setSelectedCue={setSelectedCue}
          jumpToCuePoint={jumpToCuePoint}
          crossfadeTo={jumpToCuePoint}
          formatTime={formatTime}
        />
      )}

      {showAddSong && (
        <AddSongModal
          onClose={() => setShowAddSong(false)}
          onSelectFile={handleSelectFile}
          onSelectDatabaseSong={handleSelectDatabaseSong}
          deck={deck}  // Add this line

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
