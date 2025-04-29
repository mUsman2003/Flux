import React from "react";
import { render, fireEvent, screen, act } from "@testing-library/react";
import TrackPlayback from "../components/TrackPlayback";

// Mock formatTime function
const mockFormatTime = jest.fn(
  (time) =>
    `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, "0")}`
);

describe("TrackPlayback Component", () => {
  // Setup for HTMLMediaElement mock
  window.HTMLMediaElement.prototype.load = jest.fn();
  window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
  window.HTMLMediaElement.prototype.pause = jest.fn();
  window.HTMLMediaElement.prototype.addTextTrack = jest.fn();

  const defaultProps = {
    fileName: "test-track.mp3",
    formatTime: mockFormatTime,
    currentTime: 30,
    duration: 180,
    isPlaying: false,
    isCrossfading: false,
    cuePoints: [
      { id: "cue1", time: 60 },
      { id: "cue2", time: 120 },
    ],
    selectedCue: null,
    audioRef: { current: null },
    audioSrc: "test-audio-src.mp3",
    togglePlay: jest.fn(),
    addCuePoint: jest.fn(),
    jumpToCuePoint: jest.fn(),
    setShowAddSong: jest.fn(),
    handleTimeUpdate: jest.fn(),
    handleMetadataLoaded: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a base mock audio element - but we'll create new ones in each test
    // that needs to interact with audio features
    defaultProps.audioRef = {
      current: {
        volume: 1,
        currentTime: 30,
      },
    };

    // Mock getBoundingClientRect for progress bar
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      left: 0,
      width: 100,
      right: 100,
      top: 0,
      bottom: 40,
      height: 40,
    }));

    // Mock setInterval and clearInterval
    jest.useFakeTimers();

    // Add a mock implementation for window.HTMLMediaElement.prototype.play
    // This helps with general audio testing but we'll still use specific mocks in critical tests
    if (!window.HTMLMediaElement.prototype.play) {
      window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
    }
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("renders correctly with initial props", () => {
    render(<TrackPlayback {...defaultProps} />);

    // Check track info
    expect(screen.getByText("test-track.mp3")).toBeInTheDocument();

    // Check time display
    expect(screen.getByText("0:30")).toBeInTheDocument();
    expect(screen.getByText("3:00")).toBeInTheDocument();

    // Check play button (should be play icon when isPlaying is false)
    // Use getAllByRole since there are multiple buttons, and get the first one
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeInTheDocument(); // First button should be play button

    // Check for cue markers
    const cueMarkers = document.querySelectorAll(
      'div[style*="background-color: rgb(0, 195, 255)"]'
    );
    expect(cueMarkers.length).toBe(2);

    // Check LOAD button
    expect(screen.getByText("LOAD")).toBeInTheDocument();
  });

  it("calls togglePlay when play button is clicked", () => {
    render(<TrackPlayback {...defaultProps} />);

    // Get the first button (play button)
    const buttons = screen.getAllByRole("button");
    const playButton = buttons[0];
    fireEvent.click(playButton);

    expect(defaultProps.togglePlay).toHaveBeenCalledTimes(1);
  });

  it("displays pause icon when isPlaying is true", () => {
    render(<TrackPlayback {...defaultProps} isPlaying={true} />);

    // Using DOM query to find the SVG rect element that only exists in the pause icon
    const pauseSVG = document.querySelector("svg rect");
    expect(pauseSVG).toBeInTheDocument();
  });

  it("calls addCuePoint when cue button is clicked", () => {
    render(<TrackPlayback {...defaultProps} />);

    const cueButton = screen.getAllByRole("button")[1]; // Second button is cue button
    fireEvent.click(cueButton);

    expect(defaultProps.addCuePoint).toHaveBeenCalledTimes(1);
  });

  it("calls setShowAddSong when LOAD button is clicked", () => {
    render(<TrackPlayback {...defaultProps} />);

    const loadButton = screen.getByText("LOAD");
    fireEvent.click(loadButton);

    expect(defaultProps.setShowAddSong).toHaveBeenCalledWith(true);
  });

  it("handles progress bar click to seek audio position", async () => {
    // Create a mock that will properly update and persist the currentTime value
    const mockAudio = {
      play: jest.fn(() => Promise.resolve()),
      pause: jest.fn(),
      volume: 1,
      currentTime: 30,
    };

    // Mock the setInterval implementation to directly capture and execute the callback
    let capturedIntervalCallback;
    jest.spyOn(window, "setInterval").mockImplementation((callback) => {
      capturedIntervalCallback = callback;
      return 123; // Return any number as interval ID
    });

    // Mock clearInterval to prevent any real timer behaviors
    jest.spyOn(window, "clearInterval").mockImplementation(() => {});

    // Create a new props object with our local mock
    const props = {
      ...defaultProps,
      isPlaying: false,
      audioRef: { current: mockAudio },
    };

    render(<TrackPlayback {...props} />);

    const progressBar = document.querySelector(
      'div[style*="background-color: rgb(34, 34, 34)"]'
    );

    await act(async () => {
      // Click at 75% of the progress bar
      fireEvent.click(progressBar, { clientX: 75 });
    });

    // Now verify the currentTime was set to 75% of duration (135)
    expect(mockAudio.currentTime).toBe(135); // 75% of 180

    // Check if play was called since isPlaying was false
    expect(mockAudio.play).toHaveBeenCalled();
  });

  it("doesn't call play() when isPlaying is true during progress bar click", async () => {
    // Create a mock that will properly update and persist the currentTime value
    const mockAudio = {
      play: jest.fn(() => Promise.resolve()),
      pause: jest.fn(),
      volume: 1,
      currentTime: 30,
    };

    // Mock the setInterval implementation to directly capture and execute the callback
    let capturedIntervalCallback;
    jest.spyOn(window, "setInterval").mockImplementation((callback) => {
      capturedIntervalCallback = callback;
      return 123; // Return any number as interval ID
    });

    // Mock clearInterval to prevent any real timer behaviors
    jest.spyOn(window, "clearInterval").mockImplementation(() => {});

    // Set isPlaying to true
    const props = {
      ...defaultProps,
      isPlaying: true,
      audioRef: { current: mockAudio },
    };

    render(<TrackPlayback {...props} />);

    const progressBar = document.querySelector(
      'div[style*="background-color: rgb(34, 34, 34)"]'
    );

    await act(async () => {
      // Click at 50% of the progress bar
      fireEvent.click(progressBar, { clientX: 50 });
    });

    // Verify the currentTime was set to 50% of duration (90)
    expect(mockAudio.currentTime).toBe(90); // 50% of 180

    // Check that play was NOT called since isPlaying was true
    expect(mockAudio.play).not.toHaveBeenCalled();
  });

  it("applies crossfade effect when isCrossfading is true", () => {
    render(<TrackPlayback {...defaultProps} isCrossfading={true} />);

    // Check for crossfade overlay styles
    const progressElement = document.querySelector(
      'div[style*="opacity: 0.7"]'
    );
    expect(progressElement).toBeInTheDocument();

    const overlayElement = document.querySelector(
      'div[style*="background-color: rgba(255, 136, 0, 0.3)"][style*="opacity: 0.5"]'
    );
    expect(overlayElement).toBeInTheDocument();
  });

  it("renders cue points on progress bar", () => {
    render(<TrackPlayback {...defaultProps} />);

    // Check for cue markers based on style (since there's no data-testid)
    const cueElements = document.querySelectorAll(
      'div[style*="background-color: rgb(0, 195, 255)"]'
    );
    expect(cueElements.length).toBe(2); // 2 cue points
  });

  it("highlights selected cue point", () => {
    render(<TrackPlayback {...defaultProps} selectedCue={0} />);

    // Selected cue should have different style
    const selectedCue = document.querySelector(
      'div[style*="background-color: rgb(255, 85, 0)"]'
    );
    expect(selectedCue).toBeInTheDocument();
  });

  it("calls jumpToCuePoint when a cue marker is clicked", () => {
    render(<TrackPlayback {...defaultProps} />);

    // Find cue markers using more reliable query - first get all markers,
    // then click on the first one
    const cueMarkers = document.querySelectorAll(
      'div[style*="background-color: rgb(0, 195, 255)"]'
    );
    expect(cueMarkers.length).toBe(2);

    // Click the first marker
    fireEvent.click(cueMarkers[0]);

    expect(defaultProps.jumpToCuePoint).toHaveBeenCalledWith(60, 0);
  });

  it("calls handleTimeUpdate when audio time updates", () => {
    render(<TrackPlayback {...defaultProps} />);

    const audioElement = document.querySelector("audio");
    fireEvent.timeUpdate(audioElement);

    expect(defaultProps.handleTimeUpdate).toHaveBeenCalledTimes(1);
  });

  it("calls handleMetadataLoaded when audio metadata loads", () => {
    render(<TrackPlayback {...defaultProps} />);

    const audioElement = document.querySelector("audio");
    fireEvent.loadedMetadata(audioElement);

    expect(defaultProps.handleMetadataLoaded).toHaveBeenCalledTimes(1);
  });

  it("has an audio element for testing", () => {
    render(<TrackPlayback {...defaultProps} />);

    // This test will help document expected test properties
    const audioElement = document.querySelector("audio");
    expect(audioElement).toBeInTheDocument();
  });

  it("handles click on progress bar with no audio reference", () => {
    // Test with null audioRef
    const propsWithNullAudio = { ...defaultProps, audioRef: { current: null } };
    render(<TrackPlayback {...propsWithNullAudio} />);

    const progressBar = document.querySelector(
      'div[style*="background-color: rgb(34, 34, 34)"]'
    );

    // This should not throw an error
    fireEvent.click(progressBar, { clientX: 50 });

    // No assertions needed - we're just checking it doesn't error
  });

  it("handles click on progress bar with no duration", () => {
    const propsWithNoDuration = { ...defaultProps, duration: 0 };
    render(<TrackPlayback {...propsWithNoDuration} />);

    const progressBar = document.querySelector(
      'div[style*="background-color: rgb(34, 34, 34)"]'
    );

    // This should not throw an error
    fireEvent.click(progressBar, { clientX: 50 });

    // No assertions needed - we're just checking it doesn't error
  });
});
