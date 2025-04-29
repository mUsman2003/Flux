import { renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useEQControls } from "../components/useEQControls";

describe("useEQControls Hook", () => {
  let mockAudioRef;
  let originalAudioContext;
  let originalCreateBiquadFilter;
  let originalConnect;
  let originalDisconnect;

  // Mock objects for audio nodes
  let mockSourceNode;
  let mockHighEQ;
  let mockMidEQ;
  let mockLowEQ;
  let mockDestination;
  let mockAudioContext;

  beforeEach(() => {
    jest.resetAllMocks();

    // Store original methods
    originalAudioContext = window.AudioContext;

    // Mock audio nodes
    mockHighEQ = {
      type: null,
      frequency: { value: 0 },
      gain: { value: 0 },
      Q: { value: 0 },
      connect: jest.fn(),
    };

    mockMidEQ = {
      type: null,
      frequency: { value: 0 },
      gain: { value: 0 },
      Q: { value: 0 },
      connect: jest.fn(),
    };

    mockLowEQ = {
      type: null,
      frequency: { value: 0 },
      gain: { value: 0 },
      connect: jest.fn(),
    };

    mockSourceNode = {
      connect: jest.fn(),
      disconnect: jest.fn(),
    };

    mockDestination = {};

    // Mock AudioContext
    mockAudioContext = {
      createBiquadFilter: jest.fn().mockImplementation(() => {
        const mockCalls = mockAudioContext.createBiquadFilter.mock.calls.length;
        // Return different mock filters based on call order
        if (mockCalls === 1) return mockHighEQ;
        if (mockCalls === 2) return mockMidEQ;
        return mockLowEQ;
      }),
      createMediaElementSource: jest.fn().mockReturnValue(mockSourceNode),
      destination: mockDestination,
    };

    // Mock global AudioContext
    window.AudioContext = jest.fn().mockImplementation(() => mockAudioContext);

    // Mock audio element reference
    mockAudioRef = {
      current: {
        // Add any audio element properties needed
      },
    };

    // Spy on console methods
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original methods
    window.AudioContext = originalAudioContext;
  });

  it("initializes EQ filters when audioRef is provided", () => {
    // Render hook with mock audio ref
    const { result } = renderHook(() => useEQControls(mockAudioRef));

    // Check that AudioContext was created
    expect(window.AudioContext).toHaveBeenCalled();

    // Check that source node was created
    expect(mockAudioContext.createMediaElementSource).toHaveBeenCalledWith(
      mockAudioRef.current
    );

    // Check that three biquad filters were created
    expect(mockAudioContext.createBiquadFilter).toHaveBeenCalledTimes(3);

    // Check that high EQ was configured correctly
    expect(mockHighEQ.type).toBe("highshelf");
    expect(mockHighEQ.frequency.value).toBe(5000);
    expect(mockHighEQ.gain.value).toBe(0);

    // Check that mid EQ was configured correctly
    expect(mockMidEQ.type).toBe("peaking");
    expect(mockMidEQ.frequency.value).toBe(1000);
    expect(mockMidEQ.Q.value).toBe(1.0);
    expect(mockMidEQ.gain.value).toBe(0);

    // Check that low EQ was configured correctly
    expect(mockLowEQ.type).toBe("lowshelf");
    expect(mockLowEQ.frequency.value).toBe(200);
    expect(mockLowEQ.gain.value).toBe(0);

    // Check that nodes were connected in the correct order
    expect(mockSourceNode.disconnect).toHaveBeenCalled();
    expect(mockSourceNode.connect).toHaveBeenCalledWith(mockLowEQ);
    expect(mockLowEQ.connect).toHaveBeenCalledWith(mockMidEQ);
    expect(mockMidEQ.connect).toHaveBeenCalledWith(mockHighEQ);
    expect(mockHighEQ.connect).toHaveBeenCalledWith(mockDestination);

    // Check that references were stored on the audio element
    expect(mockAudioRef.current._audioContext).toBe(mockAudioContext);
    expect(mockAudioRef.current._sourceNode).toBe(mockSourceNode);
    expect(mockAudioRef.current._eqControlsConnected).toBe(true);
    expect(mockAudioRef.current._eqHigh).toBe(mockHighEQ);
    expect(mockAudioRef.current._eqMid).toBe(mockMidEQ);
    expect(mockAudioRef.current._eqLow).toBe(mockLowEQ);
  });

  it("does not initialize if audioRef is null", () => {
    // Render hook with null audio ref
    const { result } = renderHook(() => useEQControls(null));

    // Check that AudioContext was not created
    expect(window.AudioContext).not.toHaveBeenCalled();
  });

  it("reuses existing AudioContext if available", () => {
    // Set up existing audio context
    const existingContext = {};
    mockAudioRef.current._audioContext = existingContext;

    // Render hook
    const { result } = renderHook(() => useEQControls(mockAudioRef));

    // Check that new AudioContext was not created
    expect(window.AudioContext).not.toHaveBeenCalled();
  });

  it("reuses existing source node if available", () => {
    // Set up existing audio context and source node
    mockAudioRef.current._audioContext = mockAudioContext;
    mockAudioRef.current._sourceNode = mockSourceNode;

    // Render hook
    const { result } = renderHook(() => useEQControls(mockAudioRef));

    // Check that new source node was not created
    expect(mockAudioContext.createMediaElementSource).not.toHaveBeenCalled();
  });

  it("provides working setHighEQ function", () => {
    // Render hook
    const { result } = renderHook(() => useEQControls(mockAudioRef));

    // Call setHighEQ function
    act(() => {
      result.current.setHighEQ(6);
    });

    // Check that high EQ gain was updated
    expect(mockHighEQ.gain.value).toBe(6);
  });

  it("provides working setMidEQ function", () => {
    // Render hook
    const { result } = renderHook(() => useEQControls(mockAudioRef));

    // Call setMidEQ function
    act(() => {
      result.current.setMidEQ(-3);
    });

    // Check that mid EQ gain was updated
    expect(mockMidEQ.gain.value).toBe(-3);
  });

  it("provides working setLowEQ function", () => {
    // Render hook
    const { result } = renderHook(() => useEQControls(mockAudioRef));

    // Call setLowEQ function
    act(() => {
      result.current.setLowEQ(4);
    });

    // Check that low EQ gain was updated
    expect(mockLowEQ.gain.value).toBe(4);
  });

  it("handles initialization errors gracefully", () => {
    // Mock createMediaElementSource to throw an error
    mockAudioContext.createMediaElementSource.mockImplementation(() => {
      throw new Error("Test error");
    });

    // Render hook
    const { result } = renderHook(() => useEQControls(mockAudioRef));

    // Check that error was logged
    expect(console.error).toHaveBeenCalled();
    expect(console.error.mock.calls[0][0]).toBe(
      "Failed to initialize EQ controls:"
    );
  });

  it("initializes only once even if rerenders occur", () => {
    // First render
    const { rerender } = renderHook(() => useEQControls(mockAudioRef));

    // Reset mocks to check if called again
    jest.clearAllMocks();

    // Second render
    rerender();

    // AudioContext should not be created again
    expect(window.AudioContext).not.toHaveBeenCalled();
    expect(mockAudioContext.createBiquadFilter).not.toHaveBeenCalled();
  });

  it("initializes with webkitAudioContext if standard AudioContext is not available", () => {
    // Remove standard AudioContext
    window.AudioContext = undefined;

    // Set up webkit alternative
    const mockWebkitContext = { ...mockAudioContext };
    window.webkitAudioContext = jest
      .fn()
      .mockImplementation(() => mockWebkitContext);

    // Render hook
    const { result } = renderHook(() => useEQControls(mockAudioRef));

    // Check that webkit version was used
    expect(window.webkitAudioContext).toHaveBeenCalled();

    // Cleanup
    window.webkitAudioContext = undefined;
  });
});
