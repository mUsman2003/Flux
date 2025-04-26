// Create Echo effect
export const createEchoEffect = (audioContext, intensity) => {
  const delay = audioContext.createDelay();
  delay.delayTime.value = intensity / 1000;

  const feedback = audioContext.createGain();
  feedback.gain.value = 0.4;

  const wetDry = audioContext.createGain();
  wetDry.gain.value = 0.5;

  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wetDry);

  return delay;
};

// Create Reverb effect
export const createReverbEffect = (audioContext, intensity) => {
  const convolver = audioContext.createConvolver();

  // Create impulse response buffer
  const impulseLength = intensity * 50;
  const impulse = audioContext.createBuffer(
    2,
    impulseLength,
    audioContext.sampleRate
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
export const createFlangerEffect = (audioContext, intensity) => {
  const delay = audioContext.createDelay();
  const depth = intensity / 500;
  delay.delayTime.value = depth;

  // Modulate the delay time with an LFO
  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();

  lfo.frequency.value = 0.3;
  lfoGain.gain.value = depth / 2;

  lfo.connect(lfoGain);
  lfoGain.connect(delay.delayTime);
  lfo.start(0);

  return delay;
};

// Create Distortion effect
export const createDistortionEffect = (audioContext, intensity) => {
  const distortion = audioContext.createWaveShaper();
  const amount = intensity / 25;

  // Create the distortion curve
  const curve = new Float32Array(audioContext.sampleRate);
  for (let i = 0; i < audioContext.sampleRate; i++) {
    const x = (i * 2) / audioContext.sampleRate - 1;
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
  }

  distortion.curve = curve;
  distortion.oversample = "4x";

  return distortion;
};

// Create Low Pass filter effect
export const createLowPassEffect = (audioContext, intensity) => {
  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 5000 - intensity * 45; // More intensity = lower cutoff
  filter.Q.value = 1;

  return filter;
};

// Create High Pass filter effect
export const createHighPassEffect = (audioContext, intensity) => {
  const filter = audioContext.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = intensity * 50; // More intensity = higher cutoff
  filter.Q.value = 1;

  return filter;
};
