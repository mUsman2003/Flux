import React, { useState, useEffect, useRef } from "react";
import Knob from "./Knob";

const AudioEffects = ({ audioRef }) => {
  const [activeEffect, setActiveEffect] = useState(null);
  const [intensity, setIntensity] = useState(50);
  const [wet, setWet] = useState(0.6); // Default wet/dry mix
  const [feedback, setFeedback] = useState(0.5); // Default feedback

  // Use refs to persist audio nodes across renders
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const effectNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const wetGainRef = useRef(null);
  const dryGainRef = useRef(null);
  const feedbackGainRef = useRef(null);
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
      console.log("Initializing audio effects context");

      // Check if the audio element is already connected to an audio context
      if (audioRef.current._audioEffectsConnected) {
        console.log("Audio element already connected to effects chain");

        // Get existing context and nodes
        audioContextRef.current = audioRef.current._audioContext;
        sourceNodeRef.current = audioRef.current._sourceNode;
        gainNodeRef.current = audioRef.current._gainNode;
      } else {
        // Create audio context
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();

        // Create source node
        sourceNodeRef.current =
          audioContextRef.current.createMediaElementSource(audioRef.current);

        // Create gain node
        gainNodeRef.current = audioContextRef.current.createGain();

        // Connect source -> gain -> destination initially
        sourceNodeRef.current.connect(gainNodeRef.current);
        gainNodeRef.current.connect(audioContextRef.current.destination);

        // Mark the audio element to prevent double initialization
        audioRef.current._audioEffectsConnected = true;
        audioRef.current._audioContext = audioContextRef.current;
        audioRef.current._sourceNode = sourceNodeRef.current;
        audioRef.current._gainNode = gainNodeRef.current;
      }

      // Create wet and dry gain nodes for effects mixing
      wetGainRef.current = audioContextRef.current.createGain();
      wetGainRef.current.gain.value = wet;

      dryGainRef.current = audioContextRef.current.createGain();
      dryGainRef.current.gain.value = 1 - wet;

      // Mark as initialized
      initializedRef.current = true;
      console.log("Audio effects context initialized successfully");
    } catch (error) {
      console.error("Failed to initialize audio effects context:", error);
    }
  }, [audioRef]);

  // Apply or remove effects when activeEffect changes
  useEffect(() => {
    if (!initializedRef.current) return;

    console.log(`Effect change: ${activeEffect || "none"}`);

    const { current: audioContext } = audioContextRef;
    const { current: sourceNode } = sourceNodeRef;
    const { current: gainNode } = gainNodeRef;

    // Get the final destination node
    const finalDestination = audioRef.current._eqControlsConnected
      ? audioRef.current._eqLow // Connect to EQ input if available
      : audioContextRef.current.destination; // Otherwise to context destination

    // Clear previous effect setup
    if (effectNodeRef.current) {
      // Disconnect everything for a clean slate
      sourceNode.disconnect();
      effectNodeRef.current.disconnect();
      wetGainRef.current.disconnect();
      dryGainRef.current.disconnect();

      // Reset feedback connections if they exist
      if (feedbackGainRef.current) {
        feedbackGainRef.current.disconnect();
        feedbackGainRef.current = null;
      }

      effectNodeRef.current = null;
    } else {
      // Just disconnect source node to prepare for new connections
      sourceNode.disconnect();
    }

    // If no effect selected, just create direct connection
    if (!activeEffect) {
      console.log("No effect active - connecting source directly");
      sourceNode.connect(finalDestination);
      return;
    }

    // Create and setup the selected effect
    let effectNode = null;

    switch (activeEffect) {
      case "echo":
        effectNode = createEchoEffect();
        break;
      case "reverb":
        effectNode = createReverbEffect();
        break;
      case "flanger":
        effectNode = createFlangerEffect();
        break;
      case "distortion":
        effectNode = createDistortionEffect();
        break;
      case "lowpass":
        effectNode = createLowPassEffect();
        break;
      case "highpass":
        effectNode = createHighPassEffect();
        break;
      default:
        // Fall back to direct connection
        sourceNode.connect(finalDestination);
        return;
    }

    if (!effectNode) {
      console.error("Failed to create effect");
      sourceNode.connect(finalDestination);
      return;
    }

    console.log(`Created ${activeEffect} effect`);

    // Reset wet/dry gain nodes
    wetGainRef.current = audioContext.createGain();
    wetGainRef.current.gain.value = wet;

    dryGainRef.current = audioContext.createGain();
    dryGainRef.current.gain.value = 1 - wet;

    // Create parallel paths for wet/dry mixing
    // 1. Dry path: source -> dryGain -> destination
    sourceNode.connect(dryGainRef.current);
    dryGainRef.current.connect(finalDestination);

    // 2. Wet path: source -> effect -> wetGain -> destination
    sourceNode.connect(effectNode);
    effectNode.connect(wetGainRef.current);
    wetGainRef.current.connect(finalDestination);

    // Store effect node reference
    effectNodeRef.current = effectNode;

    console.log("Effect routing completed");
  }, [activeEffect]);

  // Update wet/dry mix when parameter changes
  useEffect(() => {
    if (!initializedRef.current || !wetGainRef.current || !dryGainRef.current)
      return;

    wetGainRef.current.gain.value = wet;
    dryGainRef.current.gain.value = 1 - wet;
  }, [wet]);

  // Update feedback when parameter changes
  useEffect(() => {
    if (!initializedRef.current || !activeEffect || !feedbackGainRef.current)
      return;

    feedbackGainRef.current.gain.value = feedback;
  }, [feedback, activeEffect]);

  // Update intensity parameter
  useEffect(() => {
    if (!initializedRef.current || !activeEffect || !effectNodeRef.current)
      return;

    updateEffectIntensity();
  }, [intensity, activeEffect]);

  // Function to update effect parameter based on intensity
  const updateEffectIntensity = () => {
    if (!effectNodeRef.current) return;

    const { current: effect } = effectNodeRef;

    switch (activeEffect) {
      case "echo":
        if (effect.delayTime) {
          effect.delayTime.value = intensity / 1000; // 0-100ms
        }
        break;
      case "lowpass":
        if (effect.frequency) {
          effect.frequency.value = 200 + intensity * 40; // 200Hz - 4200Hz
        }
        break;
      case "highpass":
        if (effect.frequency) {
          effect.frequency.value = 200 + (100 - intensity) * 40; // Inverted for highpass
        }
        break;
      case "distortion":
        if ("curve" in effect) {
          const amount = intensity / 25;
          const curve = makeDistortionCurve(amount);
          effect.curve = curve;
        }
        break;
      case "flanger":
        // Flanger depth update logic would go here if needed
        break;
      case "reverb":
        // Can't update reverb without recreating it
        break;
    }
  };

  // Create Echo effect
  const createEchoEffect = () => {
    const context = audioContextRef.current;
    const delay = context.createDelay();
    delay.delayTime.value = intensity / 1000; // 0-100ms

    feedbackGainRef.current = context.createGain();
    feedbackGainRef.current.gain.value = feedback;

    delay.connect(feedbackGainRef.current);
    feedbackGainRef.current.connect(delay);

    return delay;
  };

  // Create Reverb effect
  const createReverbEffect = () => {
    const context = audioContextRef.current;
    const convolver = context.createConvolver();

    // Create impulse response buffer
    const impulseLength = intensity * 50;
    const impulse = context.createBuffer(2, impulseLength, context.sampleRate);

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
    const context = audioContextRef.current;
    const delay = context.createDelay();
    const depth = intensity / 500;
    delay.delayTime.value = depth;

    // Modulate the delay time with an LFO
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();

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
    const context = audioContextRef.current;
    const distortion = context.createWaveShaper();
    const amount = intensity / 25;
    distortion.curve = makeDistortionCurve(amount);
    distortion.oversample = "4x";
    return distortion;
  };

  // Create Low Pass Filter effect
  const createLowPassEffect = () => {
    const context = audioContextRef.current;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 200 + intensity * 40; // 200Hz - 4200Hz
    filter.Q.value = 1;
    return filter;
  };

  // Create High Pass Filter effect
  const createHighPassEffect = () => {
    const context = audioContextRef.current;
    const filter = context.createBiquadFilter();
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
