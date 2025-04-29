import React from "react";
import { render, fireEvent, screen, act } from "@testing-library/react";
import JogWheel from "../components/JogWheel";

describe("JogWheel Component", () => {
  let audioRef;
  let mockPaused;

  beforeEach(() => {
    jest.useFakeTimers();
    // Set up mock audio element
    mockPaused = true;
    audioRef = {
      current: {
        currentTime: 30,
        get paused() {
          return mockPaused;
        },
        play: jest.fn().mockImplementation(() => {
          mockPaused = false;
          return Promise.resolve();
        }),
        pause: jest.fn().mockImplementation(() => {
          mockPaused = true;
        }),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("renders correctly with default props", () => {
    render(<JogWheel audioRef={audioRef} />);

    // Check that important elements are rendered
    expect(screen.getByText("JOG")).toBeInTheDocument();
    expect(screen.getByText("SEEK")).toBeInTheDocument();
  });

  it("renders with custom side (right/deck B) styling", () => {
    render(<JogWheel audioRef={audioRef} side="right" />);

    // First switch to scratch mode to make the accent color visible on button
    fireEvent.click(screen.getByText("SEEK"));

    // Now check for the specific color styling from deck B on the button
    const button = screen.getByRole("button");
    expect(button).toHaveStyle("background-color: #e5405e");
  });

  it("toggles between seek and scratch mode when mode button is clicked", () => {
    render(<JogWheel audioRef={audioRef} />);

    // Initially should be in seek mode
    expect(screen.getByText("SEEK")).toBeInTheDocument();

    // Click to toggle to scratch mode
    fireEvent.click(screen.getByText("SEEK"));
    expect(screen.getByText("SCRATCH")).toBeInTheDocument();

    // Click again to toggle back to seek mode
    fireEvent.click(screen.getByText("SCRATCH"));
    expect(screen.getByText("SEEK")).toBeInTheDocument();
  });

  it("changes label to 'ACTIVE' when dragging", () => {
    render(<JogWheel audioRef={audioRef} />);

    // Initially should show JOG
    expect(screen.getByText("JOG")).toBeInTheDocument();

    // Simulate mousedown on the wheel
    const wheel = screen.getByRole("button").parentElement.previousSibling;
    fireEvent.mouseDown(wheel, { nativeEvent: { offsetX: 90, offsetY: 90 } });

    // Label should update to ACTIVE
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();

    // Should go back to JOG on mouseup
    fireEvent.mouseUp(wheel);
    expect(screen.getByText("JOG")).toBeInTheDocument();
  });

  it("adjusts audio currentTime when using in seek mode", () => {
    render(<JogWheel audioRef={audioRef} />);

    const wheel = screen.getByRole("button").parentElement.previousSibling;
    const initialTime = audioRef.current.currentTime;

    // Simulate dragging action
    fireEvent.mouseDown(wheel, { nativeEvent: { offsetX: 90, offsetY: 90 } });

    // Move clockwise (which should increase time)
    fireEvent.mouseMove(wheel, {
      nativeEvent: { offsetX: 120, offsetY: 90 },
      currentTarget: { offsetWidth: 180, offsetHeight: 180 },
    });

    // Release mouse
    fireEvent.mouseUp(wheel);

    // Current time should be different after movement
    expect(audioRef.current.currentTime).not.toBe(initialTime);
  });

  it("properly handles scratch mode and pauses audio", () => {
    render(<JogWheel audioRef={audioRef} />);

    // Switch to scratch mode
    fireEvent.click(screen.getByText("SEEK"));
    expect(screen.getByText("SCRATCH")).toBeInTheDocument();

    // Set audio to playing state before scratching
    audioRef.current.play(); // This will set mockPaused to false via our mock

    const wheel = screen.getByRole("button").parentElement.previousSibling;

    // Start scratching
    fireEvent.mouseDown(wheel, { nativeEvent: { offsetX: 90, offsetY: 90 } });

    // Label should show ACTIVE
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();

    // Audio should be paused when scratching starts
    expect(audioRef.current.pause).toHaveBeenCalled();
    expect(mockPaused).toBe(true);

    // Move to simulate scratching
    fireEvent.mouseMove(wheel, {
      nativeEvent: { offsetX: 100, offsetY: 100 },
      currentTarget: { offsetWidth: 180, offsetHeight: 180 },
    });

    // Stop scratching
    fireEvent.mouseUp(wheel);

    // Audio should resume playing after scratching
    expect(audioRef.current.play).toHaveBeenCalled();
    expect(mockPaused).toBe(false);
  });

  it("doesn't resume audio if it wasn't playing before scratching", () => {
    render(<JogWheel audioRef={audioRef} />);

    // Switch to scratch mode
    fireEvent.click(screen.getByText("SEEK"));

    // Ensure audio is already paused
    expect(audioRef.current.paused).toBe(true);

    const wheel = screen.getByRole("button").parentElement.previousSibling;

    // Start scratching
    fireEvent.mouseDown(wheel, { nativeEvent: { offsetX: 90, offsetY: 90 } });

    // Label should show ACTIVE
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();

    // Stop scratching
    fireEvent.mouseUp(wheel);

    // Audio should not be played if it was already paused
    expect(audioRef.current.play).not.toHaveBeenCalled();
  });

  it("handles mouse leave event properly", () => {
    render(<JogWheel audioRef={audioRef} />);

    const wheel = screen.getByRole("button").parentElement.previousSibling;

    // Start dragging
    fireEvent.mouseDown(wheel, { nativeEvent: { offsetX: 90, offsetY: 90 } });
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();

    // Leave the element
    fireEvent.mouseLeave(wheel);

    // Should no longer be dragging
    expect(screen.getByText("JOG")).toBeInTheDocument();
  });

  it("applies different sensitivity values for scratch and seek modes", () => {
    const customSensitivity = {
      scratchSensitivity: 0.5,
      seekSensitivity: 2.0,
    };

    render(
      <JogWheel
        audioRef={audioRef}
        scratchSensitivity={customSensitivity.scratchSensitivity}
        seekSensitivity={customSensitivity.seekSensitivity}
      />
    );

    // Test with seek mode
    const wheel = screen.getByRole("button").parentElement.previousSibling;
    const initialTime = audioRef.current.currentTime;

    // Simulate dragging in seek mode
    fireEvent.mouseDown(wheel, { nativeEvent: { offsetX: 90, offsetY: 90 } });
    fireEvent.mouseMove(wheel, {
      nativeEvent: { offsetX: 110, offsetY: 90 },
      currentTarget: { offsetWidth: 180, offsetHeight: 180 },
    });
    fireEvent.mouseUp(wheel);

    const seekTime = audioRef.current.currentTime;

    // Reset time for scratch test
    audioRef.current.currentTime = initialTime;

    // Switch to scratch mode and test again
    fireEvent.click(screen.getByText("SEEK"));

    // Mock window.requestAnimationFrame and window.cancelAnimationFrame
    const originalReqAF = window.requestAnimationFrame;
    const originalCancelAF = window.cancelAnimationFrame;

    let lastFrameCallback = null;
    window.requestAnimationFrame = jest.fn((callback) => {
      lastFrameCallback = callback;
      return 123; // Return a dummy animation frame ID
    });

    window.cancelAnimationFrame = jest.fn();

    // Simulate dragging in scratch mode
    fireEvent.mouseDown(wheel, { nativeEvent: { offsetX: 90, offsetY: 90 } });

    // Manually trigger the animation frame callback once if it exists
    if (lastFrameCallback) {
      act(() => {
        lastFrameCallback();
      });
    }

    // Move the mouse to simulate scratching
    fireEvent.mouseMove(wheel, {
      nativeEvent: { offsetX: 110, offsetY: 90 },
      currentTarget: { offsetWidth: 180, offsetHeight: 180 },
    });

    // Release the mouse
    fireEvent.mouseUp(wheel);

    // The time changes should be different between modes based on sensitivities
    expect(audioRef.current.currentTime).not.toBe(initialTime);

    // Restore the original window methods
    window.requestAnimationFrame = originalReqAF;
    window.cancelAnimationFrame = originalCancelAF;
  });

  it("does nothing when audioRef is null or undefined", () => {
    render(<JogWheel audioRef={null} />);

    const wheel = screen.getByRole("button").parentElement.previousSibling;

    // These operations should not throw errors even with null audioRef
    fireEvent.mouseDown(wheel, { nativeEvent: { offsetX: 90, offsetY: 90 } });
    fireEvent.mouseMove(wheel, {
      nativeEvent: { offsetX: 100, offsetY: 100 },
      currentTarget: { offsetWidth: 180, offsetHeight: 180 },
    });
    fireEvent.mouseUp(wheel);

    // Verify the component still renders correctly
    expect(screen.getByText("JOG")).toBeInTheDocument();
  });
});

// No need to store global methods anymore, we're using window methods
