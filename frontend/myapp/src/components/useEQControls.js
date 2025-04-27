import { useEffect, useRef } from "react";

export const useEQControls = (audioRef) => {
  const audioContextRef = useRef(null);
  const highEQRef = useRef(null);
  const midEQRef = useRef(null);
  const lowEQRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!audioRef?.current || initializedRef.current) return;

    const initEQ = async () => {
      try {
        // Get or create AudioContext
        audioContextRef.current =
          audioRef.current._audioContext ||
          new (window.AudioContext || window.webkitAudioContext)();

        // Create source node if it doesn't exist
        sourceNodeRef.current =
          audioRef.current._sourceNode ||
          audioContextRef.current.createMediaElementSource(audioRef.current);

        // Create EQ nodes
        highEQRef.current = audioContextRef.current.createBiquadFilter();
        highEQRef.current.type = "highshelf";
        highEQRef.current.frequency.value = 5000;
        highEQRef.current.gain.value = 0;

        midEQRef.current = audioContextRef.current.createBiquadFilter();
        midEQRef.current.type = "peaking";
        midEQRef.current.frequency.value = 1000;
        midEQRef.current.Q.value = 1.0;
        midEQRef.current.gain.value = 0;

        lowEQRef.current = audioContextRef.current.createBiquadFilter();
        lowEQRef.current.type = "lowshelf";
        lowEQRef.current.frequency.value = 200;
        lowEQRef.current.gain.value = 0;

        // Disconnect any existing connections
        sourceNodeRef.current.disconnect();

        // Connect the EQ chain
        sourceNodeRef.current.connect(lowEQRef.current);
        lowEQRef.current.connect(midEQRef.current);
        midEQRef.current.connect(highEQRef.current);

        // Connect to destination (this will be modified by AudioEffects if needed)
        highEQRef.current.connect(audioContextRef.current.destination);

        // Store references
        audioRef.current._audioContext = audioContextRef.current;
        audioRef.current._sourceNode = sourceNodeRef.current;
        audioRef.current._eqControlsConnected = true;
        audioRef.current._eqHigh = highEQRef.current;
        audioRef.current._eqMid = midEQRef.current;
        audioRef.current._eqLow = lowEQRef.current;

        initializedRef.current = true;
        console.log("EQ controls initialized successfully");
      } catch (error) {
        console.error("Failed to initialize EQ controls:", error);
      }
    };

    initEQ();

    return () => {
      // Cleanup if needed
    };
  }, [audioRef]);

  const setHighEQ = (value) => {
    if (highEQRef.current) {
      highEQRef.current.gain.value = value;
      console.log("High EQ set to:", value);
    }
  };

  const setMidEQ = (value) => {
    if (midEQRef.current) {
      midEQRef.current.gain.value = value;
      console.log("Mid EQ set to:", value);
    }
  };

  const setLowEQ = (value) => {
    if (lowEQRef.current) {
      lowEQRef.current.gain.value = value;
      console.log("Low EQ set to:", value);
    }
  };

  return { setHighEQ, setMidEQ, setLowEQ };
};
