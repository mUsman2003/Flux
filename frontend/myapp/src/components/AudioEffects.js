import React, { useState, useEffect, useRef } from "react";

const AudioEffects = ({ audioRef }) => {
  const [activeEffect, setActiveEffect] = useState(null);
  const [intensity, setIntensity] = useState(50);

  // Use refs to persist audio nodes across renders
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const effectNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const initializedRef = useRef(false);

  // Available effects
  const effects = [
    { id: "echo", name: "Echo", color: "#3498db" },
    { id: "reverb", name: "Reverb", color: "#9b59b6" },
    { id: "flanger", name: "Flanger", color: "#e74c3c" },
    { id: "distortion", name: "Distortion", color: "#f39c12" },
    { id: "lowpass", name: "Low Pass", color: "#27ae60" },
    { id: "highpass", name: "High Pass", color: "#16a085" },
  ];

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

  // Apply or remove effects when activeEffect changes
  useEffect(() => {
    // Only proceed if audio context is initialized
    if (!initializedRef.current) return;

    const audioContext = audioContextRef.current;
    const sourceNode = sourceNodeRef.current;
    const gainNode = gainNodeRef.current;

    // Disconnect previous effect if any
    if (effectNodeRef.current) {
      sourceNode.disconnect();
      effectNodeRef.current.disconnect();
      sourceNode.connect(gainNode);
      effectNodeRef.current = null;
    }

    if (!activeEffect) return;

    // Create effect based on selected type
    let newEffectNode;

    switch (activeEffect) {
      case "echo":
        newEffectNode = createEchoEffect();
        break;
      case "reverb":
        newEffectNode = createReverbEffect();
        break;
      case "flanger":
        newEffectNode = createFlangerEffect();
        break;
      case "distortion":
        newEffectNode = createDistortionEffect();
        break;
      case "lowpass":
        newEffectNode = createLowPassEffect();
        break;
      case "highpass":
        newEffectNode = createHighPassEffect();
        break;
      default:
        return;
    }

    // Connect the new effect chain
    sourceNode.disconnect();
    sourceNode.connect(newEffectNode);
    newEffectNode.connect(gainNode);

    effectNodeRef.current = newEffectNode;
  }, [activeEffect, intensity]);

  // Create Echo effect
  const createEchoEffect = () => {
    const delay = audioContextRef.current.createDelay();
    delay.delayTime.value = intensity / 1000;

    const feedback = audioContextRef.current.createGain();
    feedback.gain.value = 0.4;

    const wetDry = audioContextRef.current.createGain();
    wetDry.gain.value = 0.5;

    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wetDry);

    return delay;
  };

  // Create Reverb effect
  const createReverbEffect = () => {
    const convolver = audioContextRef.current.createConvolver();

    // Create impulse response buffer
    const impulseLength = intensity * 50;
    const impulse = audioContextRef.current.createBuffer(
      2,
      impulseLength,
      audioContextRef.current.sampleRate
    );

    // Fill the buffer with white noise that decays exponentially
    for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < impulseLength; i++) {
        channelData[i] =
          (Math.random() * 2 - 1) *
          Math.pow(1 - i / impulseLength, intensity / 50);
      }
    }

    convolver.buffer = impulse;
    return convolver;
  };

  // Create Flanger effect
  const createFlangerEffect = () => {
    const delay = audioContextRef.current.createDelay();
    const depth = intensity / 500;
    delay.delayTime.value = depth;

    // Modulate the delay time with an LFO
    const lfo = audioContextRef.current.createOscillator();
    const lfoGain = audioContextRef.current.createGain();

    lfo.frequency.value = 0.3;
    lfoGain.gain.value = depth / 2;

    lfo.connect(lfoGain);
    lfoGain.connect(delay.delayTime);
    lfo.start(0);

    return delay;
  };

  // Create Distortion effect
  const createDistortionEffect = () => {
    const distortion = audioContextRef.current.createWaveShaper();
    const amount = intensity / 25;

    // Create the distortion curve
    const curve = new Float32Array(audioContextRef.current.sampleRate);
    for (let i = 0; i < audioContextRef.current.sampleRate; i++) {
      const x = (i * 2) / audioContextRef.current.sampleRate - 1;
      curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
    }

    distortion.curve = curve;
    distortion.oversample = "4x";

    return distortion;
  };

  // Create Low Pass filter effect
  const createLowPassEffect = () => {
    const filter = audioContextRef.current.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 5000 - intensity * 45; // More intensity = lower cutoff
    filter.Q.value = 1;

    return filter;
  };

  // Create High Pass filter effect
  const createHighPassEffect = () => {
    const filter = audioContextRef.current.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = intensity * 50; // More intensity = higher cutoff
    filter.Q.value = 1;

    return filter;
  };

  // Toggle effect on/off
  const toggleEffect = (effectId) => {
    if (activeEffect === effectId) {
      setActiveEffect(null); // Turn off the effect
    } else {
      setActiveEffect(effectId); // Turn on the effect
    }
  };

  // If audio context failed to initialize, show error message
  if (!initializedRef.current && audioRef?.current) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Effects</h3>
        <p style={styles.errorMessage}>
          Unable to initialize audio effects. The audio element may already be
          in use.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Effects</h3>

      <div style={styles.effectButtons}>
        {effects.map((effect) => (
          <button
            key={effect.id}
            style={{
              ...styles.effectButton,
              backgroundColor:
                activeEffect === effect.id ? effect.color : "#444",
              borderColor: effect.color,
            }}
            onClick={() => toggleEffect(effect.id)}
          >
            {effect.name}
          </button>
        ))}
      </div>

      {activeEffect && (
        <div style={styles.intensityControl}>
          <span style={styles.label}>Intensity</span>
          <input
            type="range"
            min="1"
            max="100"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            style={styles.slider}
          />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#1e1e1e",
    padding: "10px",
    borderRadius: "8px",
    marginTop: "15px",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    color: "white",
    fontSize: "16px",
    margin: "0 0 10px 0",
    textAlign: "center",
  },
  effectButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    justifyContent: "center",
  },
  effectButton: {
    padding: "6px 12px",
    border: "2px solid",
    borderRadius: "4px",
    cursor: "pointer",
    color: "white",
    fontWeight: "bold",
    fontSize: "12px",
    transition: "all 0.2s ease",
  },
  intensityControl: {
    display: "flex",
    alignItems: "center",
    marginTop: "12px",
    gap: "10px",
  },
  label: {
    color: "white",
    fontSize: "14px",
  },
  slider: {
    flexGrow: 1,
    accentColor: "#1e90ff",
  },
  errorMessage: {
    color: "#e74c3c",
    fontSize: "14px",
    textAlign: "center",
  },
};

export default AudioEffects;
