import React from "react";
import { renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import useCrossfadeAudio from "../components/useCrossfadeAudio";

describe("useCrossfadeAudio Hook", () => {
  let mockAudioRef;
  let originalPlay;
  let originalClearInterval;
  let mockClearInterval;
  let mockSetInterval;

  beforeEach(() => {
    // Save original functions
    originalPlay = global.HTMLMediaElement.prototype.play;
    originalClearInterval = global.clearInterval;

    // Mock audio reference with necessary properties
    mockAudioRef = {
      current: {
        volume: 1.0,
        currentTime: 0,
        paused: false,
        play: jest.fn().mockResolvedValue(undefined),
      },
    };

    // Mock timer functions
    jest.useFakeTimers();
    mockClearInterval = jest.fn();
    mockSetInterval = jest.spyOn(global, "setInterval");
    global.clearInterval = mockClearInterval;
  });

  afterEach(() => {
    // Restore original functions
    global.HTMLMediaElement.prototype.play = originalPlay;
    global.clearInterval = originalClearInterval;
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("returns the crossfadeTo function", () => {
    const { result } = renderHook(() => useCrossfadeAudio(mockAudioRef));

    expect(result.current).toHaveProperty("crossfadeTo");
    expect(typeof result.current.crossfadeTo).toBe("function");
  });

  it("does nothing if audio reference is null", () => {
    mockAudioRef.current = null;
    const { result } = renderHook(() => useCrossfadeAudio(mockAudioRef));

    act(() => {
      result.current.crossfadeTo(30);
    });

    expect(mockSetInterval).not.toHaveBeenCalled();
  });

  it("sets up interval for crossfade with default duration", () => {
    const { result } = renderHook(() => useCrossfadeAudio(mockAudioRef));

    act(() => {
      result.current.crossfadeTo(30);
    });

    // Should set up interval at 100ms steps
    expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 100);
  });

  it("sets up interval with custom fade duration", () => {
    const customFadeDuration = 2; // 2 seconds
    const { result } = renderHook(() =>
      useCrossfadeAudio(mockAudioRef, customFadeDuration)
    );

    act(() => {
      result.current.crossfadeTo(30);
    });

    // Should set up interval at 100ms steps
    expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 100);

    // Should have more steps for longer duration
    // We don't directly test the number of steps but we test the fade behavior
  });

  it("fades out volume during first half of the fade", () => {
    const { result } = renderHook(() => useCrossfadeAudio(mockAudioRef));
    mockAudioRef.current.volume = 1.0;

    act(() => {
      result.current.crossfadeTo(30);
    });

    // Default fade duration is 1 second, with 10 steps, so 5 steps for first half
    // First step (20% fade out)
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(mockAudioRef.current.volume).toBeCloseTo(0.8); // 20% reduction

    // Second step (40% fade out)
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(mockAudioRef.current.volume).toBeCloseTo(0.6); // 40% reduction

    // Third step (60% fade out)
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(mockAudioRef.current.volume).toBeCloseTo(0.4); // 60% reduction

    // Fourth step (80% fade out)
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(mockAudioRef.current.volume).toBeCloseTo(0.2); // 80% reduction

    // Fifth step (100% fade out)
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(mockAudioRef.current.volume).toBeCloseTo(0); // 100% reduction
  });

  it("jumps to target time and fades in during second half", () => {
    const { result } = renderHook(() => useCrossfadeAudio(mockAudioRef));
    mockAudioRef.current.volume = 1.0;
    const targetTime = 30;

    act(() => {
      result.current.crossfadeTo(targetTime);
    });

    // Complete the first half of the fade (5 steps)
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(mockAudioRef.current.volume).toBeCloseTo(0);

    // Sixth step - should jump to target time and start fade in
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(mockAudioRef.current.currentTime).toBe(targetTime);
    expect(mockAudioRef.current.play).toHaveBeenCalled();
    expect(mockAudioRef.current.volume).toBeCloseTo(0.2); // 20% fade in

    // Seventh step (40% fade in)
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(mockAudioRef.current.volume).toBeCloseTo(0.4);

    // Eighth step (60% fade in)
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(mockAudioRef.current.volume).toBeCloseTo(0.6);

    // Ninth step (80% fade in)
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(mockAudioRef.current.volume).toBeCloseTo(0.8);

    // Tenth step (100% fade in)
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(mockAudioRef.current.volume).toBeCloseTo(1.0); // Back to original volume

    // Should clear interval after completing all steps
    expect(mockClearInterval).toHaveBeenCalled();
  });

  it("handles paused audio correctly", () => {
    mockAudioRef.current.paused = true;
    const { result } = renderHook(() => useCrossfadeAudio(mockAudioRef));

    act(() => {
      result.current.crossfadeTo(30);
    });

    // Complete the first half of the fade
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Sixth step - should jump to target time but NOT play if was paused
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(mockAudioRef.current.currentTime).toBe(30);
    expect(mockAudioRef.current.play).not.toHaveBeenCalled();
  });

  it("handles play errors gracefully", () => {
    // Mock console.error to check it's called
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Set up play to reject with an error
    const playError = new Error("Play was prevented");
    mockAudioRef.current.play = jest.fn().mockRejectedValue(playError);

    const { result } = renderHook(() => useCrossfadeAudio(mockAudioRef));

    act(() => {
      result.current.crossfadeTo(30);
    });

    // Complete the first half of the fade
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Sixth step - should try to play and handle error
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Play should have been attempted
    expect(mockAudioRef.current.play).toHaveBeenCalled();

    // Restore console.error
    console.error = originalConsoleError;
  });

  it("returns a cleanup function that clears the interval", () => {
    const { result } = renderHook(() => useCrossfadeAudio(mockAudioRef));

    let cleanup;
    act(() => {
      cleanup = result.current.crossfadeTo(30);
    });

    expect(typeof cleanup).toBe("function");

    // Call the cleanup function
    act(() => {
      cleanup();
    });

    expect(mockClearInterval).toHaveBeenCalled();
  });

  it("preserves original volume on completion", () => {
    mockAudioRef.current.volume = 0.75; // Start with non-default volume
    const { result } = renderHook(() => useCrossfadeAudio(mockAudioRef));

    act(() => {
      result.current.crossfadeTo(30);
    });

    // Complete all fade steps
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should restore the original volume exactly
    expect(mockAudioRef.current.volume).toBe(0.75);
  });
});
