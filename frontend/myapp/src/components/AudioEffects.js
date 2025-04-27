import React, { useState, useEffect, useRef } from "react";
import Knob from "./Knob";

const AudioEffects = ({ audioRef }) => {
  const [activeEffect, setActiveEffect] = useState(null);
  const [intensity, setIntensity] = useState(50);
  const [wet, setWet] = useState(1.0); // Wet/dry mix knob parameter
  const [feedback, setFeedback] = useState(0.5); // Feedback knob parameter

  // Use refs to persist audio nodes across renders
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const effectNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const wetGainRef = useRef(null);
  const dryGainRef = useRef(null);
  const feedbackGainRef = useRef(null);
  const initializedRef = useRef(false);

  // Use a ref to store the original connections to restore later
  const originalDestinationRef = useRef(null);

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
      // Check if the audio element is already connected to an audio context
      // This is important to avoid conflicts with the EQ controls
      if (audioRef.current._audioEffectsConnected) {
        console.log("Audio element already connected to effects chain");

        // Get existing audio context
        audioContextRef.current = audioRef.current._audioContext;
        sourceNodeRef.current = audioRef.current._sourceNode;
        gainNodeRef.current = audioRef.current._gainNode;
        originalDestinationRef.current = audioRef.current._destination;

        initializedRef.current = true;
      } else {
        // Create audio context
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();

        // Create source node
        sourceNodeRef.current =
          audioContextRef.current.createMediaElementSource(audioRef.current);

        // Create gain node
        gainNodeRef.current = audioContextRef.current.createGain();

        // Create wet and dry gain nodes for effects mixing
        wetGainRef.current = audioContextRef.current.createGain();
        dryGainRef.current = audioContextRef.current.createGain();

        // Remember the original destination (may be EQ chain or audio context destination)
        originalDestinationRef.current = audioContextRef.current.destination;

        // Connect source -> gain -> destination (default chain with no effects)
        sourceNodeRef.current.connect(gainNodeRef.current);
        gainNodeRef.current.connect(originalDestinationRef.current);

        // Mark audio element to prevent double initialization
        audioRef.current._audioEffectsConnected = true;
        audioRef.current._audioContext = audioContextRef.current;
        audioRef.current._sourceNode = sourceNodeRef.current;
        audioRef.current._gainNode = gainNodeRef.current;
        audioRef.current._destination = originalDestinationRef.current;

        // Mark as initialized
        initializedRef.current = true;

        console.log("Audio effects context initialized successfully");
      }
    } catch (error) {
      console.error("Failed to initialize audio effects context:", error);
    }

    // Cleanup on unmount
    return () => {
      if (effectNodeRef.current) {
        effectNodeRef.current.disconnect();

        // Reconnect the original chain
        gainNodeRef.current.disconnect();
        gainNodeRef.current.connect(originalDestinationRef.current);
      }
    };
  }, [audioRef]);

  // Apply or remove effects when activeEffect changes
  useEffect(() => {
    // Only proceed if audio context is initialized
    if (!initializedRef.current) return;

    const sourceNode = sourceNodeRef.current;
    const gainNode = gainNodeRef.current;
    const destination = originalDestinationRef.current;

    console.log("Effect change - Active effect:", activeEffect);
    console.log(
      "Has EQ connected:",
      audioRef.current._eqControlsConnected ? "Yes" : "No"
    );

    // Disconnect previous effect if any
    if (effectNodeRef.current) {
      console.log("Disconnecting previous effect");

      // Disconnect everything first
      sourceNode.disconnect();
      effectNodeRef.current.disconnect();
      if (wetGainRef.current) wetGainRef.current.disconnect();
      if (dryGainRef.current) dryGainRef.current.disconnect();
      if (feedbackGainRef.current) feedbackGainRef.current.disconnect();
      gainNode.disconnect();

      // Reset the effect node reference
      effectNodeRef.current = null;
    } else {
      // If there was no previous effect, just disconnect the source
      // to prepare for new connections
      sourceNode.disconnect();
      gainNode.disconnect();
    }

    // If turning off the effect, restore original routing
    if (!activeEffect) {
      console.log("No active effect - Restoring basic audio path");
      // Basic routing: source -> gain -> destination
      sourceNode.connect(gainNode);
      gainNode.connect(destination);
      return;
    }

    // Create the appropriate effect node
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

    console.log(`Created new ${activeEffect} effect`);

    // Create wet/dry mix nodes
    wetGainRef.current = audioContextRef.current.createGain();
    dryGainRef.current = audioContextRef.current.createGain();

    // Set initial wet/dry values
    wetGainRef.current.gain.value = wet;
    dryGainRef.current.gain.value = 1 - wet;
    sourceNode.disconnect();

    // Connect the audio graph with the new effect
    // Parallel paths:
    // 1. source -> effect -> wetGain -> gain -> destination
    // 2. source -> dryGain -> gain -> destination
    if (audioRef.current._eqControlsConnected) {
      // Disconnect EQ chain if it exists
      audioRef.current._eqHigh.disconnect();
    }
    sourceNode.connect(dryGainRef.current);

    sourceNode.connect(newEffectNode);
    newEffectNode.connect(wetGainRef.current);
    if (audioRef.current._eqControlsConnected) {
      // Connect both paths through EQ
      dryGainRef.current.connect(audioRef.current._eqLow);
      wetGainRef.current.connect(audioRef.current._eqLow);
    } else {
      // Connect directly to destination
      dryGainRef.current.connect(gainNode);
      wetGainRef.current.connect(gainNode);
      gainNode.connect(destination);
    }

    // Store the reference to the new effect node
    effectNodeRef.current = newEffectNode;

    if (effectNodeRef.current) {
      // Disconnect effect chain
      effectNodeRef.current.disconnect();
      if (wetGainRef.current) wetGainRef.current.disconnect();
      if (dryGainRef.current) dryGainRef.current.disconnect();

      // Reconnect the original chain
      sourceNode.disconnect();
      gainNode.disconnect();

      if (audioRef.current._eqControlsConnected) {
        // Reconnect through EQ
        sourceNode.connect(audioRef.current._eqLow);
        audioRef.current._eqHigh.connect(gainNode);
      } else {
        // Connect directly
        sourceNode.connect(gainNode);
      }
      gainNode.connect(destination);
    }

    console.log("Effect routing complete");
  }, [activeEffect]);

  // Update wet/dry mix when the "wet" parameter changes
  useEffect(() => {
    if (!initializedRef.current || !activeEffect) return;

    if (wetGainRef.current && dryGainRef.current) {
      wetGainRef.current.gain.value = wet;
      dryGainRef.current.gain.value = 1 - wet;
    }
  }, [wet, activeEffect]);

  // Update feedback when the parameter changes
  useEffect(() => {
    if (!initializedRef.current || !activeEffect || !feedbackGainRef.current)
      return;

    feedbackGainRef.current.gain.value = feedback;
  }, [feedback, activeEffect]);

  // Update intensity parameter
  useEffect(() => {
    if (!initializedRef.current || !activeEffect || !effectNodeRef.current)
      return;

    // Apply intensity parameter update to the active effect
    updateEffectIntensity();
  }, [intensity, activeEffect]);

  // Function to update effect parameter based on the intensity
  const updateEffectIntensity = () => {
    if (!effectNodeRef.current) return;

    switch (activeEffect) {
      case "echo":
        // For echo, we adjust the delay time
        if (effectNodeRef.current.delayTime) {
          effectNodeRef.current.delayTime.value = intensity / 1000;
        }
        break;
      case "lowpass":
      case "highpass":
        // For filters, adjust the frequency
        if (effectNodeRef.current.frequency) {
          const freq =
            activeEffect === "lowpass"
              ? 200 + intensity * 40 // 200Hz - 4200Hz
              : 200 + (100 - intensity) * 40; // Invert for highpass
          effectNodeRef.current.frequency.value = freq;
        }
        break;
      case "distortion":
        // We need to regenerate the curve for distortion
        if (effectNodeRef.current.curve) {
          const amount = intensity / 25;
          const curve = makeDistortionCurve(amount);
          effectNodeRef.current.curve = curve;
        }
        break;
      // Other effects can update their parameters here
    }
  };

  // Create Echo effect
  const createEchoEffect = () => {
    const delay = audioContextRef.current.createDelay();
    delay.delayTime.value = intensity / 1000;

    feedbackGainRef.current = audioContextRef.current.createGain();
    feedbackGainRef.current.gain.value = feedback;

    delay.connect(feedbackGainRef.current);
    feedbackGainRef.current.connect(delay);

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

  // Helper function to create distortion curve
  const makeDistortionCurve = (amount) => {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; ++i) {
      const x = (i * 2) / samples - 1;
      curve[i] =
        ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  };

  // Create Distortion effect
  const createDistortionEffect = () => {
    const distortion = audioContextRef.current.createWaveShaper();
    const amount = intensity / 25;
    distortion.curve = makeDistortionCurve(amount);
    distortion.oversample = "4x";
    return distortion;
  };

  // Create Low Pass Filter effect
  const createLowPassEffect = () => {
    const filter = audioContextRef.current.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 200 + intensity * 40; // 200Hz - 4200Hz
    filter.Q.value = 1;
    return filter;
  };

  // Create High Pass Filter effect
  const createHighPassEffect = () => {
    const filter = audioContextRef.current.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 200 + (100 - intensity) * 40; // Invert control
    filter.Q.value = 1;
    return filter;
  };

  return (
    <div style={styles.container}>
      <div style={styles.effectsHeader}>
        <h3 style={styles.effectsTitle}>EFFECTS</h3>
      </div>

      <div style={styles.effectsGrid}>
        {effects.map((effect) => (
          <button
            key={effect.id}
            style={{
              ...styles.effectButton,
              backgroundColor:
                activeEffect === effect.id ? effect.color : "#333",
              color: activeEffect === effect.id ? "#111" : "#fff",
            }}
            onClick={() =>
              setActiveEffect(activeEffect === effect.id ? null : effect.id)
            }
          >
            {effect.name}
          </button>
        ))}
      </div>

      {activeEffect && (
        <div style={styles.effectControls}>
          <div style={styles.knobsRow}>
            <Knob
              label="INTENSITY"
              min={0}
              max={100}
              defaultValue={intensity}
              color={
                effects.find((e) => e.id === activeEffect)?.color || "#00c3ff"
              }
              onChange={(value) => setIntensity(value)}
            />

            <Knob
              label="WET/DRY"
              min={0}
              max={1}
              defaultValue={wet}
              color={
                effects.find((e) => e.id === activeEffect)?.color || "#00c3ff"
              }
              onChange={(value) => setWet(value)}
            />

            {(activeEffect === "echo" || activeEffect === "reverb") && (
              <Knob
                label="FEEDBACK"
                min={0}
                max={0.9}
                defaultValue={feedback}
                color={
                  effects.find((e) => e.id === activeEffect)?.color || "#00c3ff"
                }
                onChange={(value) => setFeedback(value)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#1f1f1f",
    borderRadius: "8px",
    padding: "12px",
    marginTop: "15px",
    border: "1px solid #333",
  },
  effectsHeader: {
    marginBottom: "10px",
    borderBottom: "1px solid #333",
    paddingBottom: "5px",
  },
  effectsTitle: {
    margin: 0,
    fontSize: "16px",
    color: "#ccc",
    fontWeight: "bold",
    textAlign: "center",
  },
  effectsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
    marginBottom: "15px",
  },
  effectButton: {
    padding: "8px 0",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "12px",
    transition: "all 0.2s",
  },
  effectControls: {
    borderTop: "1px solid #333",
    paddingTop: "15px",
  },
  knobsRow: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
};

export default AudioEffects;
