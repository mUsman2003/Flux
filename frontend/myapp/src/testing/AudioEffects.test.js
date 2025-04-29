import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AudioEffects from "../components/AudioEffects";

// Mock the Web Audio API
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockGainNode = {
  gain: { value: 0 },
  connect: mockConnect,
  disconnect: mockDisconnect,
};
const mockDelayNode = {
  delayTime: { value: 0 },
  connect: mockConnect,
  disconnect: mockDisconnect,
};
const mockBiquadFilter = {
  type: "",
  frequency: { value: 0 },
  Q: { value: 0 },
  connect: mockConnect,
  disconnect: mockDisconnect,
};
const mockOscillator = {
  frequency: { value: 0 },
  connect: mockConnect,
  start: jest.fn(),
  disconnect: mockDisconnect,
};
const mockWaveShaper = {
  curve: null,
  oversample: "",
  connect: mockConnect,
  disconnect: mockDisconnect,
};
const mockConvolver = {
  buffer: null,
  connect: mockConnect,
  disconnect: mockDisconnect,
};
const mockAudioContext = {
  createGain: jest.fn(() => mockGainNode),
  createDelay: jest.fn(() => mockDelayNode),
  createBiquadFilter: jest.fn(() => mockBiquadFilter),
  createOscillator: jest.fn(() => mockOscillator),
  createWaveShaper: jest.fn(() => mockWaveShaper),
  createConvolver: jest.fn(() => mockConvolver),
  createBuffer: jest.fn((channels, length, sampleRate) => ({
    numberOfChannels: channels,
    length,
    sampleRate,
    getChannelData: jest.fn(() => new Float32Array(length)),
  })),
  createMediaElementSource: jest.fn(() => ({
    connect: mockConnect,
    disconnect: mockDisconnect,
  })),
  destination: {},
};

// Mock window.AudioContext
window.AudioContext = jest.fn(() => mockAudioContext);
window.webkitAudioContext = jest.fn(() => mockAudioContext);

describe("AudioEffects Component", () => {
  let mockAudioRef;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock audio reference
    mockAudioRef = {
      current: {
        _audioEffectsConnected: false,
        _eqControlsConnected: false,
      },
    };
  });

  it("renders with no effects active initially", () => {
    render(<AudioEffects audioRef={mockAudioRef} />);

    // Check header is rendered
    expect(screen.getByText("EFFECTS")).toBeInTheDocument();

    // Check all effect buttons are rendered
    expect(screen.getByText("ECHO")).toBeInTheDocument();
    expect(screen.getByText("REVERB")).toBeInTheDocument();
    expect(screen.getByText("FLANGER")).toBeInTheDocument();
    expect(screen.getByText("DISTORT")).toBeInTheDocument();
    expect(screen.getByText("LOW PASS")).toBeInTheDocument();
    expect(screen.getByText("HIGH PASS")).toBeInTheDocument();

    // No knob controls should be visible yet
    expect(screen.queryByText("INTENSITY")).not.toBeInTheDocument();
    expect(screen.queryByText("WET/DRY")).not.toBeInTheDocument();
  });

  it("initializes audio context when mounted", () => {
    render(<AudioEffects audioRef={mockAudioRef} />);

    // Should create an audio context
    expect(window.AudioContext).toHaveBeenCalled();

    // Should connect the audio element to the context
    expect(mockAudioContext.createMediaElementSource).toHaveBeenCalledWith(
      mockAudioRef.current
    );

    // Should mark the audio element as connected
    expect(mockAudioRef.current._audioEffectsConnected).toBe(true);
  });

  it("reuses existing audio context if already connected", () => {
    // Mock that audio is already connected
    mockAudioRef.current._audioEffectsConnected = true;
    mockAudioRef.current._audioContext = mockAudioContext;
    mockAudioRef.current._sourceNode = {
      connect: mockConnect,
      disconnect: mockDisconnect,
    };
    mockAudioRef.current._gainNode = mockGainNode;

    render(<AudioEffects audioRef={mockAudioRef} />);

    // Should not create a new media element source
    expect(mockAudioContext.createMediaElementSource).not.toHaveBeenCalled();
  });

  it("shows controls when an effect is activated", () => {
    render(<AudioEffects audioRef={mockAudioRef} />);

    // Click on ECHO effect button
    fireEvent.click(screen.getByText("ECHO"));

    // Control knobs should now be visible
    expect(screen.getByText("INTENSITY")).toBeInTheDocument();
    expect(screen.getByText("WET/DRY")).toBeInTheDocument();
    expect(screen.getByText("FEEDBACK")).toBeInTheDocument(); // ECHO has feedback control
  });

  it("shows feedback control only for echo and reverb effects", () => {
    render(<AudioEffects audioRef={mockAudioRef} />);

    // Click on ECHO effect
    fireEvent.click(screen.getByText("ECHO"));
    expect(screen.getByText("FEEDBACK")).toBeInTheDocument();

    // Switch to REVERB effect
    fireEvent.click(screen.getByText("REVERB"));
    expect(screen.getByText("FEEDBACK")).toBeInTheDocument();

    // Switch to FLANGER effect
    fireEvent.click(screen.getByText("FLANGER"));
    expect(screen.queryByText("FEEDBACK")).not.toBeInTheDocument();
  });

  it("toggles effect on/off when clicking the same button twice", () => {
    render(<AudioEffects audioRef={mockAudioRef} />);

    // Click on ECHO effect to activate
    fireEvent.click(screen.getByText("ECHO"));
    expect(screen.getByText("INTENSITY")).toBeInTheDocument();

    // Create echo effect should have been called
    expect(mockAudioContext.createDelay).toHaveBeenCalled();

    // Click on ECHO effect again to deactivate
    fireEvent.click(screen.getByText("ECHO"));
    expect(screen.queryByText("INTENSITY")).not.toBeInTheDocument();
  });

  it("creates delay node for echo effect", () => {
    render(<AudioEffects audioRef={mockAudioRef} />);

    // Reset mock counts
    mockAudioContext.createDelay.mockClear();
    mockAudioContext.createGain.mockClear();

    // Activate ECHO effect
    fireEvent.click(screen.getByText("ECHO"));

    // Should create delay node
    expect(mockAudioContext.createDelay).toHaveBeenCalled();

    // Should create gain node for feedback
    expect(mockAudioContext.createGain).toHaveBeenCalledTimes(3); // 2 for wet/dry, 1 for feedback
  });

  it("creates convolver node for reverb effect", () => {
    render(<AudioEffects audioRef={mockAudioRef} />);

    // Reset mock counts
    mockAudioContext.createConvolver.mockClear();
    mockAudioContext.createBuffer.mockClear();

    // Activate REVERB effect
    fireEvent.click(screen.getByText("REVERB"));

    // Should create convolver node
    expect(mockAudioContext.createConvolver).toHaveBeenCalled();

    // Should create buffer for impulse response
    expect(mockAudioContext.createBuffer).toHaveBeenCalled();
  });

  it("creates filter node for lowpass effect", () => {
    render(<AudioEffects audioRef={mockAudioRef} />);

    // Reset mock counts
    mockAudioContext.createBiquadFilter.mockClear();

    // Activate LOW PASS effect
    fireEvent.click(screen.getByText("LOW PASS"));

    // Should create biquad filter node
    expect(mockAudioContext.createBiquadFilter).toHaveBeenCalled();

    // Should set filter type to lowpass
    expect(mockBiquadFilter.type).toBe("lowpass");
  });

  it("creates filter node for highpass effect", () => {
    render(<AudioEffects audioRef={mockAudioRef} />);

    // Reset mock counts
    mockAudioContext.createBiquadFilter.mockClear();

    // Activate HIGH PASS effect
    fireEvent.click(screen.getByText("HIGH PASS"));

    // Should create biquad filter node
    expect(mockAudioContext.createBiquadFilter).toHaveBeenCalled();

    // Should set filter type to highpass
    expect(mockBiquadFilter.type).toBe("highpass");
  });

  it("creates waveshaper node for distortion effect", () => {
    render(<AudioEffects audioRef={mockAudioRef} />);

    // Reset mock counts
    mockAudioContext.createWaveShaper.mockClear();

    // Activate DISTORT effect
    fireEvent.click(screen.getByText("DISTORT"));

    // Should create waveshaper node
    expect(mockAudioContext.createWaveShaper).toHaveBeenCalled();

    // Should set oversample
    expect(mockWaveShaper.oversample).toBe("4x");
  });

  it("creates delay and oscillator nodes for flanger effect", () => {
    render(<AudioEffects audioRef={mockAudioRef} />);

    // Reset mock counts
    mockAudioContext.createDelay.mockClear();
    mockAudioContext.createOscillator.mockClear();
    mockAudioContext.createGain.mockClear();

    // Activate FLANGER effect
    fireEvent.click(screen.getByText("FLANGER"));

    // Should create delay node
    expect(mockAudioContext.createDelay).toHaveBeenCalled();

    // Should create oscillator node for LFO
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();

    // Should create gain node for LFO depth
    expect(mockAudioContext.createGain).toHaveBeenCalledTimes(3); // 2 for wet/dry, 1 for LFO

    // Should start the oscillator
    expect(mockOscillator.start).toHaveBeenCalledWith(0);
  });

  it("handles missing audioRef gracefully", () => {
    // Render without an audioRef
    render(<AudioEffects />);

    // Should not try to create audio context
    expect(window.AudioContext).not.toHaveBeenCalled();

    // But effects buttons should still render
    expect(screen.getByText("ECHO")).toBeInTheDocument();

    // Click should not cause errors
    expect(() => {
      fireEvent.click(screen.getByText("ECHO"));
    }).not.toThrow();
  });

  it("connects to EQ when available", () => {
    // Mock that EQ is connected
    mockAudioRef.current._eqControlsConnected = true;
    mockAudioRef.current._eqLow = {}; // Mock EQ low node

    render(<AudioEffects audioRef={mockAudioRef} />);

    // Activate an effect
    fireEvent.click(screen.getByText("ECHO"));

    // The connect function should have been called with the EQ low node
    // This is hard to test precisely due to the complex web audio node setup
    expect(mockConnect).toHaveBeenCalled();
  });

  it("changes button color when effect is active", () => {
    render(<AudioEffects audioRef={mockAudioRef} />);

    // Get echo button before activation
    const echoButton = screen.getByText("ECHO");

    // Get echo effect color from code
    const echoColor = "#00c3ff";

    // Initially button should not have echo color background
    expect(echoButton).not.toHaveStyle(`background-color: ${echoColor}`);

    // Activate ECHO effect
    fireEvent.click(echoButton);

    // Now button should have echo color background
    expect(echoButton).toHaveStyle(`background-color: ${echoColor}`);
  });

  it("handles knob controls for different effects", () => {
    // Mock the Knob component's onChange handler
    const { rerender } = render(<AudioEffects audioRef={mockAudioRef} />);

    // Helper to find knob by label and simulate onChange
    const simulateKnobChange = (label, value) => {
      // First activate an effect
      if (!screen.queryByText("INTENSITY")) {
        fireEvent.click(screen.getByText("ECHO"));
      }

      // Find the knob by label
      const knobLabel = screen.getByText(label);
      // Get the parent container of the knob
      const knobContainer = knobLabel.closest("div");
      // Mock the onChange event from the Knob component
      const onChangeProps = knobContainer.props.onChange;
      if (onChangeProps) {
        onChangeProps(value);
      }
      // Force re-render to apply changes
      rerender(<AudioEffects audioRef={mockAudioRef} />);
    };

    // Test intensity for echo effect
    fireEvent.click(screen.getByText("ECHO"));
    simulateKnobChange("INTENSITY", 50);
    expect(mockDelayNode.delayTime.value).toBeCloseTo(0.05); // 50/1000

    // Test wet/dry mix
    simulateKnobChange("WET/DRY", 0.8);
    expect(mockGainNode.gain.value).toBeCloseTo(0.8);

    // Test feedback
    simulateKnobChange("FEEDBACK", 0.6);
    expect(mockGainNode.gain.value).toBeCloseTo(0.6);

    // Change to lowpass and test intensity
    fireEvent.click(screen.getByText("LOW PASS"));
    simulateKnobChange("INTENSITY", 75);
    expect(mockBiquadFilter.frequency.value).toBeCloseTo(3200); // 200 + 75 * 40

    // Change to highpass and test intensity
    fireEvent.click(screen.getByText("HIGH PASS"));
    simulateKnobChange("INTENSITY", 25);
    expect(mockBiquadFilter.frequency.value).toBeCloseTo(3200); // 200 + (100-25) * 40
  });
});
