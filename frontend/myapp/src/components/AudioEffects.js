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

  // Available effects with better colors
  const effects = [
    { id: "echo", name: "ECHO", color: "#00c3ff" },
    { id: "reverb", name: "REVERB", color: "#9146ff" },
    { id: "flanger", name: "FLANGER", color: "#ff3860" },
    { id: "distortion", name: "DISTORT", color: "#ffdd57" },
    { id: "lowpass", name: "LOW PASS", color: "#23d160" },
    { id: "highpass", name: "HIGH PASS", color: "#00d1b2" },
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

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>EFFECTS</h3>

      <div style={styles.effectButtons}>
        {effects.map((effect) => (
          <button
            key={effect.id}
            style={{
              ...styles.effectButton,
              backgroundColor: activeEffect === effect.id ? effect.color : "#2a2a2a",
              borderColor: effect.color,
              boxShadow: activeEffect === effect.id ? `0 0 15px ${effect.color}80` : "none",
            }}
            onClick={() => toggleEffect(effect.id)}
          >
            {effect.name}
          </button>
        ))}
      </div>

      {activeEffect && (
        <div style={styles.intensityControl}>
          <span style={styles.label}>INTENSITY</span>
          <input
            type="range"
            min="1"
            max="100"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            style={styles.slider}
          />
          <span style={styles.valueDisplay}>{intensity}%</span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#222",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "15px",
    width: "100%",
    border: "1px solid #444",
    display: "block", // Ensure it's always displayed
  },
  title: {
    color: "#00c3ff",
    fontSize: "16px",
    margin: "0 0 15px 0",
    textAlign: "center",
    letterSpacing: "1px",
    borderBottom: "1px solid #444",
    paddingBottom: "5px",
  },
  effectButtons: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
    justifyContent: "center",
  },
  effectButton: {
    padding: "10px",
    border: "2px solid",
    borderRadius: "6px",
    cursor: "pointer",
    color: "white",
    fontWeight: "bold",
    fontSize: "12px",
    transition: "all 0.3s ease",
    textAlign: "center",
    letterSpacing: "1px",
  },
  intensityControl: {
    display: "flex",
    alignItems: "center",
    marginTop: "15px",
    gap: "10px",
    backgroundColor: "#2a2a2a",
    padding: "8px 12px",
    borderRadius: "6px",
  },
  label: {
    color: "#00c3ff",
    fontSize: "12px",
    fontWeight: "bold",
    minWidth: "70px",
    letterSpacing: "1px",
  },
  slider: {
    flexGrow: 1,
    accentColor: "#00c3ff",
    height: "10px",
  },
  valueDisplay: {
    color: "#fff",
    fontSize: "12px",
    fontWeight: "bold",
    minWidth: "40px",
    textAlign: "right",
  },
  errorMessage: {
    color: "#ff3860",
    fontSize: "14px",
    textAlign: "center",
    padding: "10px",
    backgroundColor: "rgba(255, 56, 96, 0.1)",
    borderRadius: "4px",
  },
};

export default AudioEffects;