import React, { useState, useRef, useEffect } from "react";

const MicrophoneInput = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const streamRef = useRef(null);

  // Start recording from microphone
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newRecording = {
          id: Date.now(),
          name: `Input ${recordings.length + 1}`,
          url: audioUrl,
          blob: audioBlob,
          date: new Date().toLocaleString()
        };
        
        setRecordings([...recordings, newRecording]);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check your permissions.");
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };
  
  // Play selected recording
  const playRecording = (recording) => {
    if (audioPlayerRef.current) {
      if (selectedRecording && selectedRecording.id === recording.id && isPlaying) {
        // If clicking the currently playing recording, pause it
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        // Play the selected recording
        setSelectedRecording(recording);
        audioPlayerRef.current.src = recording.url;
        audioPlayerRef.current.volume = volume;
        audioPlayerRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.error("Error playing audio:", err));
      }
    }
  };
  
  // Delete a recording
  const deleteRecording = (id, event) => {
    event.stopPropagation(); // Prevent triggering the parent click handler
    
    // If the recording is currently playing, stop it
    if (selectedRecording && selectedRecording.id === id && isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
      setSelectedRecording(null);
    }
    
    // Remove the recording and revoke its URL
    const recordingToDelete = recordings.find(rec => rec.id === id);
    if (recordingToDelete) {
      URL.revokeObjectURL(recordingToDelete.url);
    }
    
    setRecordings(recordings.filter(rec => rec.id !== id));
  };
  
  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = newVolume;
    }
  };
  
  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      recordings.forEach(recording => {
        URL.revokeObjectURL(recording.url);
      });
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [recordings]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>MIC INPUT</h3>
      </div>
      
      <div style={styles.controlSection}>
        <button 
          style={{
            ...styles.recordButton,
            backgroundColor: isRecording ? "#ff4136" : "#333",
            boxShadow: isRecording ? "0 0 10px rgba(255, 65, 54, 0.5)" : "none"
          }}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? (
            <div style={styles.recordingIndicator}>
              <span style={styles.recordingDot}></span>
              STOP
            </div>
          ) : (
            "RECORD"
          )}
        </button>
        
        <div style={styles.volumeControl}>
          <span style={styles.volumeLabel}>VOL</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            style={styles.volumeSlider}
          />
        </div>
      </div>
      
      <div style={styles.recordingsList}>
        <div style={styles.listHeader}>RECORDINGS</div>
        {recordings.length === 0 ? (
          <div style={styles.noRecordings}>No recordings yet</div>
        ) : (
          recordings.map(recording => (
            <div 
              key={recording.id} 
              style={{
                ...styles.recordingItem,
                backgroundColor: selectedRecording && selectedRecording.id === recording.id ? "#00c3ff" : "#333"
              }}
              onClick={() => playRecording(recording)}
            >
              <span style={styles.recordingName}>{recording.name}</span>
              <div style={styles.recordingActions}>
                {selectedRecording && selectedRecording.id === recording.id && isPlaying ? (
                  <span style={styles.playingIndicator}>▶</span>
                ) : (
                  <span style={styles.playIcon}>▶</span>
                )}
                <button 
                  style={styles.deleteButton}
                  onClick={(e) => deleteRecording(recording.id, e)}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <audio ref={audioPlayerRef} onEnded={() => setIsPlaying(false)} />
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#2a2a2a",
    borderRadius: "8px",
    padding: "15px",
    border: "1px solid #444",
    width: "220px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    borderBottom: "1px solid #444",
    marginBottom: "15px",
    paddingBottom: "5px",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "bold",
    color: "#ff5500",
  },
  controlSection: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "15px",
  },
  recordButton: {
    backgroundColor: "#333",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  recordingIndicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  recordingDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#ff4136",
    animation: "pulse 1s infinite alternate",
  },
  volumeControl: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  volumeLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#aaa",
    width: "30px",
  },
  volumeSlider: {
    flex: 1,
    height: "6px",
    borderRadius: "3px",
    accentColor: "#00c3ff",
  },
  recordingsList: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  listHeader: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#777",
    marginBottom: "5px",
    letterSpacing: "1px",
  },
  noRecordings: {
    color: "#666",
    fontStyle: "italic",
    fontSize: "12px",
    textAlign: "center",
    padding: "15px 0",
  },
  recordingItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  recordingName: {
    fontSize: "14px",
    fontWeight: "500",
  },
  recordingActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  playIcon: {
    color: "#999",
    fontSize: "12px",
  },
  playingIndicator: {
    color: "#fff",
    fontSize: "12px",
    animation: "pulse 1s infinite alternate",
  },
  deleteButton: {
    backgroundColor: "rgba(255, 65, 54, 0.2)",
    color: "#ff4136",
    border: "none",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "14px",
    padding: 0,
  },
  "@keyframes pulse": {
    "0%": { opacity: 0.6 },
    "100%": { opacity: 1 }
  }
};

export default MicrophoneInput;