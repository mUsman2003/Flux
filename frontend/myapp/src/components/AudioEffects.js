import React, { useState, useEffect, useRef } from "react";
import { styles } from "./effectsStyles";
import { effects } from "./effectsData";
import { useAudioContext } from "./useAudioContext";
import {
  createEchoEffect,
  createReverbEffect,
  createFlangerEffect,
  createDistortionEffect,
  createLowPassEffect,
  createHighPassEffect,
} from "./effectCreators";

const AudioEffects = ({ audioRef }) => {
  const [activeEffect, setActiveEffect] = useState(null);
  const [intensity, setIntensity] = useState(50);

  // Use custom hook to handle audio context setup
  const {
    audioContextRef,
    sourceNodeRef,
    effectNodeRef,
    gainNodeRef,
    initializedRef,
  } = useAudioContext(audioRef);

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
        newEffectNode = createEchoEffect(audioContextRef.current, intensity);
        break;
      case "reverb":
        newEffectNode = createReverbEffect(audioContextRef.current, intensity);
        break;
      case "flanger":
        newEffectNode = createFlangerEffect(audioContextRef.current, intensity);
        break;
      case "distortion":
        newEffectNode = createDistortionEffect(
          audioContextRef.current,
          intensity
        );
        break;
      case "lowpass":
        newEffectNode = createLowPassEffect(audioContextRef.current, intensity);
        break;
      case "highpass":
        newEffectNode = createHighPassEffect(
          audioContextRef.current,
          intensity
        );
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
              backgroundColor:
                activeEffect === effect.id ? effect.color : "#2a2a2a",
              borderColor: effect.color,
              boxShadow:
                activeEffect === effect.id
                  ? `0 0 15px ${effect.color}80`
                  : "none",
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

export default AudioEffects;
