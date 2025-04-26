import { useRef, useEffect } from "react";

export const useAudioContext = (audioRef) => {
  // Use refs to persist audio nodes across renders
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const effectNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const initializedRef = useRef(false);

  // Initialize Audio Context only once when component mounts
  useEffect(() => {
    if (!audioRef?.current || initializedRef.current) return;

    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Create source node
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(
        audioRef.current
      );

      // Create gain node
      gainNodeRef.current = audioContextRef.current.createGain();

      // Connect source -> gain -> destination (default chain with no effects)
      sourceNodeRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);

      // Mark as initialized
      initializedRef.current = true;

      console.log("Audio context initialized successfully");
    } catch (error) {
      console.error("Failed to initialize audio context:", error);
    }

    // Cleanup on unmount
    return () => {
      if (effectNodeRef.current) {
        effectNodeRef.current.disconnect();
      }

      // Note: We don't close the AudioContext here because the audio element
      // might still be in use elsewhere in the application
    };
  }, [audioRef]);

  return {
    audioContextRef,
    sourceNodeRef,
    effectNodeRef,
    gainNodeRef,
    initializedRef,
  };
};
