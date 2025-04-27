import React, { useState, useRef, useEffect } from "react";

const RecordingButton = ({ deckA, deckB }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [useMicrophone, setUseMicrophone] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);

  // Format recording time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      stopRecording();
      if (audioContextRef.current) {
        audioContextRef.current
          .close()
          .catch((err) => console.warn("Error closing audio context:", err));
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Reset previous recording data
      audioChunksRef.current = [];
      setAudioBlob(null);
      setRecordingTime(0);

      // Create a new AudioContext for recording
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Check if we have valid deck references before proceeding
      if ((!deckA || !deckA.current) && (!deckB || !deckB.current)) {
        throw new Error(
          "No audio decks available to record. Make sure decks are loaded and playing."
        );
      }

      // Create destination for the recording
      const destination =
        audioContextRef.current.createMediaStreamDestination();

      // Flag to track if any audio was connected
      let streamsConnected = false;

      // Create a final output node where all audio will be mixed
      const masterOutput = audioContextRef.current.createGain();
      masterOutput.connect(destination);

      // Use a more reliable method to capture audio
      if (deckA?.current) {
        try {
          const deckASource = deckA.current.captureStream
            ? audioContextRef.current.createMediaStreamSource(
                deckA.current.captureStream()
              )
            : audioContextRef.current.createMediaElementSource(deckA.current);
          deckASource.connect(masterOutput);
          deckASource.connect(audioContextRef.current.destination);
          console.log(
            "Deck A connected via captureStream or MediaElementSource"
          );
          streamsConnected = true;
        } catch (err) {
          console.warn("Deck A connection failed:", err.message);
        }
      }

      if (deckB?.current) {
        try {
          const deckBSource = deckB.current.captureStream
            ? audioContextRef.current.createMediaStreamSource(
                deckB.current.captureStream()
              )
            : audioContextRef.current.createMediaElementSource(deckB.current);
          deckBSource.connect(masterOutput);
          deckBSource.connect(audioContextRef.current.destination);
          console.log(
            "Deck B connected via captureStream or MediaElementSource"
          );
          streamsConnected = true;
        } catch (err) {
          console.warn("Deck B connection failed:", err.message);
        }
      }

      // If we still haven't connected any audio, try to capture system audio
      if (!streamsConnected) {
        try {
          // Last resort: try to capture system audio
          const audioStream = await navigator.mediaDevices.getDisplayMedia({
            video: false,
            audio: true,
            preferCurrentTab: true,
          });

          const audioSource =
            audioContextRef.current.createMediaStreamSource(audioStream);
          audioSource.connect(masterOutput);

          streamsConnected = true;
          console.log("Using system audio capture as fallback");
        } catch (err) {
          throw new Error(
            "Could not access any audio sources. Please ensure your browser allows audio recording."
          );
        }
      }

      // Add microphone only if explicitly requested
      if (useMicrophone) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
          const micSource =
            audioContextRef.current.createMediaStreamSource(micStream);
          micSource.connect(masterOutput);
          console.log("Microphone connected to recorder");
        } catch (err) {
          console.info("Microphone not connected:", err.message);
        }
      }

      // Set up media recorder with best quality
      const options = {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
        audioBitsPerSecond: 128000,
      };

      const mediaRecorder = new MediaRecorder(destination.stream, options);
      mediaRecorderRef.current = mediaRecorder;

      // Set up data collection
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording completion
      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType.includes("opus")
          ? "audio/webm"
          : "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(audioBlob);
      };

      // Start the recorder
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert(`Could not start recording: ${error.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Clean up any audio context
      if (audioContextRef.current) {
        audioContextRef.current
          .close()
          .catch((err) => console.warn("Error closing audio context:", err));
        audioContextRef.current = null;
      }
    }
  };

  const downloadRecording = () => {
    if (audioBlob) {
      const fileExtension = audioBlob.type.includes("webm") ? "mp3" : "mp3";
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `DJ_Mix_${new Date()
        .toISOString()
        .slice(0, 10)}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const previewRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.play();
    }
  };

  return (
    <div style={styles.recordingContainer}>
      <div style={styles.recordingHeader}>
        <h3 style={styles.recordingTitle}>RECORDING</h3>
      </div>

      <div style={styles.recordingControls}>
        {!isRecording ? (
          <button
            onClick={startRecording}
            style={styles.recordButton}
            disabled={(!deckA || !deckA.current) && (!deckB || !deckB.current)}
          >
            <div style={styles.recordIcon}></div>
            REC
          </button>
        ) : (
          <button onClick={stopRecording} style={styles.stopButton}>
            <div style={styles.stopIcon}></div>
            STOP
          </button>
        )}

        <div style={styles.timeDisplay}>
          {isRecording ? (
            <span style={styles.recordingLabel}>
              <span style={styles.recordingDot}></span>
              REC {formatTime(recordingTime)}
            </span>
          ) : audioBlob ? (
            <span>Ready: {formatTime(recordingTime)}</span>
          ) : (
            <span>Ready to Record</span>
          )}
        </div>
      </div>

      {/* Microphone toggle switch */}
      <div style={styles.micToggle}>
        <label style={styles.micLabel}>
          <input
            type="checkbox"
            checked={useMicrophone}
            onChange={() => setUseMicrophone(!useMicrophone)}
            style={styles.checkbox}
          />
          Include Microphone
        </label>
      </div>

      {audioBlob && !isRecording && (
        <div style={styles.actionButtons}>
          <button
            onClick={previewRecording}
            style={{ ...styles.actionButton, backgroundColor: "#9146ff" }}
          >
            PREVIEW
          </button>
          <button
            onClick={downloadRecording}
            style={{ ...styles.actionButton, backgroundColor: "#00c3ff" }}
          >
            SAVE
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  recordingContainer: {
    backgroundColor: "#222",
    borderRadius: "8px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    border: "1px solid #444",
    height: "auto",
    width: "100%",
    overflow: "auto" /* Allow scrolling */,
    boxSizing: "border-box",
    scrollbarWidth: "none", // For Firefox
  },
  // Add these styles to hide the scrollbar in Webkit-based browsers
  "::-webkit-scrollbar": {
    display: "none", // Hide the scrollbar
  },

  "::-webkit-scrollbar-thumb": {
    backgroundColor: "transparent", // No color for the thumb
  },

  "::-webkit-scrollbar-track": {
    backgroundColor: "transparent", // No background for the track
  },

  recordingHeader: {
    borderBottom: "1px solid #444",
    marginBottom: "15px",
    paddingBottom: "5px",
    overflow: "hidden" /* Prevent any child elements from overflowing */,
  },
  recordingTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "bold",
    color: "#ff3860",
  },
  recordingControls: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    width: "100%",
    flexShrink: 0 /* Prevent shrinking */,
    overflow: "auto" /* Allow scrolling */,
    boxSizing: "border-box",
    scrollbarWidth: "none", // For Firefox
  },
  recordButton: {
    backgroundColor: "#333",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    padding: "0",
    fontSize: "12px",
    fontWeight: "bold",
  },
  recordIcon: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#ff3860",
    marginBottom: "4px",
  },
  stopButton: {
    backgroundColor: "#333",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    padding: "0",
    fontSize: "12px",
    fontWeight: "bold",
  },
  stopIcon: {
    width: "20px",
    height: "20px",
    backgroundColor: "#fff",
    marginBottom: "4px",
  },
  timeDisplay: {
    flex: "1",
    textAlign: "center",
    fontFamily: "monospace",
    fontSize: "16px",
    backgroundColor: "#333",
    padding: "12px",
    borderRadius: "4px",
    color: "#ddd",
    whiteSpace: "nowrap" /* Prevent text wrapping */,
    overflow: "hidden" /* Prevent any overflow */,
    textOverflow: "ellipsis" /* Ensure no content overflows */,
  },
  recordingLabel: {
    color: "#ff3860",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  recordingDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#ff3860",
    animation: "blink 1s infinite",
  },
  actionButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
    justifyContent: "space-between" /* Ensure buttons are spaced out */,
    flexShrink: 0 /* Prevent shrinking */,
  },
  actionButton: {
    flex: 1,
    border: "none",
    borderRadius: "6px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    color: "#111",
    textAlign: "center",
    whiteSpace: "nowrap" /* Prevent text wrapping */,
    overflow: "hidden" /* Prevent overflow */,
    textOverflow: "ellipsis" /* Ensure no content overflows */,
  },
  micToggle: {
    marginTop: "5px",
    padding: "5px 0",
  },
  micLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#ddd",
    fontSize: "14px",
    cursor: "pointer",
  },
  checkbox: {
    cursor: "pointer",
  },
};

export default RecordingButton;
