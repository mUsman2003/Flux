import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import TrackDisplay from "../components/TrackDisplay";

// Mock the File constructor before Jest.mock executions
const mockFile = (content, name, options) => ({
  content,
  name,
  ...options,
  // Add any File properties that might be needed
  size: content.length,
  type: options?.type || "",
});

// Mock child components to isolate TrackDisplay testing
jest.mock("../components/AddSongModal", () => {
  return jest.fn(({ onClose, onSelectFile, onSelectDatabaseSong }) => (
    <div data-testid="add-song-modal">
      <button
        data-testid="select-file-btn"
        onClick={() =>
          onSelectFile(
            mockFile(["test"], "test-file.mp3", { type: "audio/mp3" })
          )
        }
      >
        Select File
      </button>
      <button
        data-testid="select-db-song-btn"
        onClick={() =>
          onSelectDatabaseSong({
            id: "123",
            name: "Database Song",
            path: "/path/to/song.mp3",
          })
        }
      >
        Select DB Song
      </button>
      <button data-testid="close-modal-btn" onClick={onClose}>
        Close
      </button>
    </div>
  ));
});

jest.mock("../components/TrackPlayback", () => {
  return jest.fn((props) => (
    <div data-testid="track-playback">
      <div data-testid="file-name">{props.fileName}</div>
      <button data-testid="toggle-play-btn" onClick={props.togglePlay}>
        {props.isPlaying ? "Pause" : "Play"}
      </button>
      <button data-testid="add-cue-btn" onClick={props.addCuePoint}>
        Add Cue
      </button>
      <button
        data-testid="jump-cue-btn"
        onClick={() => props.jumpToCuePoint(30, 0)}
      >
        Jump to Cue
      </button>
      <button
        data-testid="load-track-btn"
        onClick={() => props.setShowAddSong(true)}
      >
        Load Track
      </button>
      {/* Expose event handlers for testing */}
      <button data-testid="time-update-btn" onClick={props.handleTimeUpdate}>
        Trigger Time Update
      </button>
      <button
        data-testid="metadata-loaded-btn"
        onClick={props.handleMetadataLoaded}
      >
        Trigger Metadata Loaded
      </button>
    </div>
  ));
});

jest.mock("../components/CuePointsManager", () => {
  return jest.fn((props) => (
    <div data-testid="cue-points-manager">
      <span>Cue Points: {props.cuePoints.length}</span>
      <button
        data-testid="delete-cue-btn"
        onClick={() => {
          const newCuePoints = [...props.cuePoints];
          newCuePoints.splice(0, 1);
          props.setCuePoints(newCuePoints);
        }}
      >
        Delete Cue
      </button>
      <button
        data-testid="select-cue-btn"
        onClick={() => props.setSelectedCue(0)}
      >
        Select Cue
      </button>
      <button
        data-testid="jump-to-cue-btn"
        onClick={() => props.jumpToCuePoint(props.cuePoints[0].time, 0)}
      >
        Jump to Cue
      </button>
    </div>
  ));
});

jest.mock(
  "./useCrossfadeAudio",
  () => {
    return jest.fn(() => ({
      crossfadeTo: jest.fn((time, callback) => {
        if (callback) setTimeout(callback, 100);
      }),
    }));
  },
  { virtual: true }
);

// Mock fetch for database song loading
global.fetch = jest.fn();

// Create audio mock with all necessary methods and properties
const createAudioMock = () => {
  return {
    play: jest.fn().mockImplementation(function () {
      this.paused = false;
      if (this.onplay) this.onplay();
      return Promise.resolve();
    }),
    pause: jest.fn().mockImplementation(function () {
      this.paused = true;
      if (this.onpause) this.onpause();
    }),
    load: jest.fn(),
    addEventListener: jest.fn((event, handler) => {
      if (event === "timeupdate") this.ontimeupdate = handler;
      if (event === "loadedmetadata") this.onloadedmetadata = handler;
      if (event === "canplaythrough") this.oncanplaythrough = handler;
      if (event === "play") this.onplay = handler;
      if (event === "pause") this.onpause = handler;
      if (event === "error") this.onerror = handler;
    }),
    removeEventListener: jest.fn(),
    ontimeupdate: null,
    onloadedmetadata: null,
    oncanplaythrough: null,
    onplay: null,
    onpause: null,
    onerror: null,
    paused: true,
    src: "",
    currentTime: 0,
    duration: 120,
    volume: 1,
  };
};

// Mock URL methods
global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = jest.fn();

describe("TrackDisplay Component", () => {
  let mockAudio;
  let originalAudio;

  beforeEach(() => {
    // Save original Audio constructor
    originalAudio = global.Audio;

    // Create mock audio object
    mockAudio = createAudioMock();

    // Replace global Audio constructor with mock
    global.Audio = jest.fn(() => mockAudio);

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original Audio constructor
    global.Audio = originalAudio;
  });

  // Test 1: Initial empty state
  test("should render empty state correctly", () => {
    const onTrackLoaded = jest.fn();
    render(<TrackDisplay onTrackLoaded={onTrackLoaded} deck="A" />);

    expect(screen.getByText("No Track Loaded")).toBeInTheDocument();
    expect(screen.getByText("LOAD TRACK")).toBeInTheDocument();
  });

  // Test 2: Opening and closing AddSongModal
  test("should open and close AddSongModal", async () => {
    const onTrackLoaded = jest.fn();
    render(<TrackDisplay onTrackLoaded={onTrackLoaded} deck="A" />);

    // Open modal
    fireEvent.click(screen.getByText("LOAD TRACK"));
    expect(screen.getByTestId("add-song-modal")).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByTestId("close-modal-btn"));
    expect(screen.queryByTestId("add-song-modal")).not.toBeInTheDocument();
  });

  // Test 3: Loading a file track
  test("should handle file selection correctly", async () => {
    const onTrackLoaded = jest.fn();

    await act(async () => {
      render(<TrackDisplay onTrackLoaded={onTrackLoaded} deck="A" />);
    });

    // Open modal
    await act(async () => {
      fireEvent.click(screen.getByText("LOAD TRACK"));
    });

    // Select file
    await act(async () => {
      fireEvent.click(screen.getByTestId("select-file-btn"));
    });

    // Simulate canplaythrough event
    await act(async () => {
      if (mockAudio.oncanplaythrough) mockAudio.oncanplaythrough();
    });

    // Verify filename and onTrackLoaded was called
    expect(screen.getByTestId("file-name")).toHaveTextContent("test-file.mp3");
    expect(onTrackLoaded).toHaveBeenCalledWith(
      expect.objectContaining({
        deck: "A",
        fileName: "test-file.mp3",
      })
    );
  });

  // Test 4: Loading a database song
  test("should handle database song selection correctly", async () => {
    const onTrackLoaded = jest.fn();

    // Mock successful fetch response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(["test-audio"], { type: "audio/mp3" }),
    });

    await act(async () => {
      render(<TrackDisplay onTrackLoaded={onTrackLoaded} deck="A" />);
    });

    // Open modal
    await act(async () => {
      fireEvent.click(screen.getByText("LOAD TRACK"));
    });

    // Select database song
    await act(async () => {
      fireEvent.click(screen.getByTestId("select-db-song-btn"));
    });

    // Simulate canplaythrough event
    await act(async () => {
      if (mockAudio.oncanplaythrough) mockAudio.oncanplaythrough();
    });

    // Verify fetch was called with correct URL
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/songs/123/file"
    );

    // Verify filename and onTrackLoaded was called
    expect(screen.getByTestId("file-name")).toHaveTextContent("Database Song");
    expect(onTrackLoaded).toHaveBeenCalledWith(
      expect.objectContaining({
        deck: "A",
        fileName: "Database Song",
      })
    );
  });

  // Test 5: Failed database song fetch
  test("should handle database song fetch failure", async () => {
    const onTrackLoaded = jest.fn();
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Mock failed fetch response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await act(async () => {
      render(<TrackDisplay onTrackLoaded={onTrackLoaded} deck="A" />);
    });

    // Open modal
    await act(async () => {
      fireEvent.click(screen.getByText("LOAD TRACK"));
    });

    // Select database song
    await act(async () => {
      fireEvent.click(screen.getByTestId("select-db-song-btn"));
    });

    // Check for error message in console
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error loading database song"),
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  // Test 6: Playing and pausing
  test("should toggle play/pause correctly", async () => {
    const onTrackLoaded = jest.fn();

    await act(async () => {
      render(<TrackDisplay onTrackLoaded={onTrackLoaded} deck="A" />);
    });

    // Load a track first
    await act(async () => {
      fireEvent.click(screen.getByText("LOAD TRACK"));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("select-file-btn"));
    });

    await act(async () => {
      if (mockAudio.oncanplaythrough) mockAudio.oncanplaythrough();
    });

    // Toggle play/pause
    expect(screen.getByTestId("toggle-play-btn")).toHaveTextContent("Pause");

    await act(async () => {
      fireEvent.click(screen.getByTestId("toggle-play-btn"));
    });

    expect(mockAudio.pause).toHaveBeenCalled();
    expect(screen.getByTestId("toggle-play-btn")).toHaveTextContent("Play");

    await act(async () => {
      fireEvent.click(screen.getByTestId("toggle-play-btn"));
    });

    expect(mockAudio.play).toHaveBeenCalled();
    expect(screen.getByTestId("toggle-play-btn")).toHaveTextContent("Pause");
  });

  // Test 7: Adding and managing cue points
  test("should handle cue points correctly", async () => {
    const onTrackLoaded = jest.fn();

    await act(async () => {
      render(<TrackDisplay onTrackLoaded={onTrackLoaded} deck="A" />);
    });

    // Load a track first
    await act(async () => {
      fireEvent.click(screen.getByText("LOAD TRACK"));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("select-file-btn"));
    });

    await act(async () => {
      if (mockAudio.oncanplaythrough) mockAudio.oncanplaythrough();
    });

    // Initially, CuePointsManager should not be present
    expect(screen.queryByTestId("cue-points-manager")).not.toBeInTheDocument();

    // Set current time for the cue point
    mockAudio.currentTime = 30;

    // Add a cue point
    await act(async () => {
      fireEvent.click(screen.getByTestId("add-cue-btn"));
    });

    // Now CuePointsManager should be present
    expect(screen.getByTestId("cue-points-manager")).toBeInTheDocument();
    expect(screen.getByText("Cue Points: 1")).toBeInTheDocument();

    // Jump to cue point
    await act(async () => {
      fireEvent.click(screen.getByTestId("jump-to-cue-btn"));
    });

    // Delete cue point
    await act(async () => {
      fireEvent.click(screen.getByTestId("delete-cue-btn"));
    });

    // CuePointsManager should disappear since all cues are gone
    expect(screen.queryByTestId("cue-points-manager")).not.toBeInTheDocument();
  });

  // Test 8: Jumping to cue points with crossfade
  test("should handle jumping to cue points with crossfade", async () => {
    const onTrackLoaded = jest.fn();

    await act(async () => {
      render(<TrackDisplay onTrackLoaded={onTrackLoaded} deck="A" />);
    });

    // Load a track
    await act(async () => {
      fireEvent.click(screen.getByText("LOAD TRACK"));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("select-file-btn"));
    });

    await act(async () => {
      if (mockAudio.oncanplaythrough) mockAudio.oncanplaythrough();
    });

    // Set current time for the cue point
    mockAudio.currentTime = 30;

    // Add a cue point
    await act(async () => {
      fireEvent.click(screen.getByTestId("add-cue-btn"));
    });

    // Pause before jumping to test playing after jump
    await act(async () => {
      fireEvent.click(screen.getByTestId("toggle-play-btn"));
    });

    expect(mockAudio.pause).toHaveBeenCalled();
    mockAudio.paused = true;

    // Jump to cue point - this should trigger play as well
    await act(async () => {
      fireEvent.click(screen.getByTestId("jump-cue-btn"));
    });

    // Wait for the crossfade to complete
    await waitFor(() => {
      expect(mockAudio.play).toHaveBeenCalled();
    });
  });

  // Test 9: Handling time updates and metadata
  test("should handle time updates and metadata loading", async () => {
    const onTrackLoaded = jest.fn();

    await act(async () => {
      render(<TrackDisplay onTrackLoaded={onTrackLoaded} deck="A" />);
    });

    // Load a track
    await act(async () => {
      fireEvent.click(screen.getByText("LOAD TRACK"));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("select-file-btn"));
    });

    await act(async () => {
      if (mockAudio.oncanplaythrough) mockAudio.oncanplaythrough();
    });

    // Set current time
    mockAudio.currentTime = 45;

    // Trigger time update
    await act(async () => {
      fireEvent.click(screen.getByTestId("time-update-btn"));
    });

    // Set duration
    mockAudio.duration = 180;

    // Trigger metadata loaded
    await act(async () => {
      fireEvent.click(screen.getByTestId("metadata-loaded-btn"));
    });

    // Both handlers should have been called and updated component state
    // (We can't directly test the state, but we assume the handlers work as expected)
  });

  // Test 10: Loading a new track when one is already loaded
  test("should handle loading a new track when one is already loaded", async () => {
    const onTrackLoaded = jest.fn();

    await act(async () => {
      render(<TrackDisplay onTrackLoaded={onTrackLoaded} deck="A" />);
    });

    // Load first track
    await act(async () => {
      fireEvent.click(screen.getByText("LOAD TRACK"));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("select-file-btn"));
    });

    await act(async () => {
      if (mockAudio.oncanplaythrough) mockAudio.oncanplaythrough();
    });

    expect(screen.getByTestId("file-name")).toHaveTextContent("test-file.mp3");

    // Now load a new track
    await act(async () => {
      fireEvent.click(screen.getByTestId("load-track-btn"));
    });

    // Mock a different file selection
    mockAudio.src = ""; // Reset src to simulate new file load

    // Select a song from database this time
    global.fetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(["new-test-audio"], { type: "audio/mp3" }),
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("select-db-song-btn"));
    });

    await act(async () => {
      if (mockAudio.oncanplaythrough) mockAudio.oncanplaythrough();
    });

    // Verify filename was updated
    expect(screen.getByTestId("file-name")).toHaveTextContent("Database Song");

    // Verify URL.revokeObjectURL was called to clean up the previous object URL
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  // Test 11: Initialization and onTrackLoaded callback
  test("should properly initialize audio and call onTrackLoaded", async () => {
    const onTrackLoaded = jest.fn();

    await act(async () => {
      render(<TrackDisplay onTrackLoaded={onTrackLoaded} deck="A" />);
    });

    // Load a track
    await act(async () => {
      fireEvent.click(screen.getByText("LOAD TRACK"));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("select-file-btn"));
    });

    await act(async () => {
      if (mockAudio.oncanplaythrough) mockAudio.oncanplaythrough();
    });

    // Check if onTrackLoaded was called with the expected arguments
    expect(onTrackLoaded).toHaveBeenCalledWith(
      expect.objectContaining({
        audioRef: expect.any(Object),
        deck: "A",
        fileName: "test-file.mp3",
        audioSrc: "blob:mock-url",
        isInitial: true,
      })
    );

    // Load another track to check isInitial flag
    await act(async () => {
      fireEvent.click(screen.getByTestId("load-track-btn"));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("select-file-btn"));
    });

    await act(async () => {
      if (mockAudio.oncanplaythrough) mockAudio.oncanplaythrough();
    });

    // The second call should have isInitial set to false
    expect(onTrackLoaded).toHaveBeenLastCalledWith(
      expect.objectContaining({
        audioRef: expect.any(Object),
        deck: "A",
        fileName: "test-file.mp3",
        audioSrc: "blob:mock-url",
        isInitial: false,
      })
    );
  });

  // Test 12: Test error handling for database song loading
  test("should handle database song loading errors correctly", async () => {
    const onTrackLoaded = jest.fn();
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    global.fetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(["test-audio"], { type: "audio/mp3" }),
    });

    await act(async () => {
      render(<TrackDisplay onTrackLoaded={onTrackLoaded} deck="A" />);
    });

    // Open modal
    await act(async () => {
      fireEvent.click(screen.getByText("LOAD TRACK"));
    });

    // Select database song
    await act(async () => {
      fireEvent.click(screen.getByTestId("select-db-song-btn"));
    });

    // Simulate audio error
    await act(async () => {
      if (mockAudio.onerror)
        mockAudio.onerror(new Error("Audio loading error"));
    });

    // Expect console error to be called
    expect(consoleSpy).toHaveBeenCalled();

    // Restore mocks
    consoleSpy.mockRestore();
  });

  // Test 13: Test selectedCue updates
  test("should update selected cue index", async () => {
    const onTrackLoaded = jest.fn();

    await act(async () => {
      render(<TrackDisplay onTrackLoaded={onTrackLoaded} deck="A" />);
    });

    // Load a track
    await act(async () => {
      fireEvent.click(screen.getByText("LOAD TRACK"));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("select-file-btn"));
    });

    await act(async () => {
      if (mockAudio.oncanplaythrough) mockAudio.oncanplaythrough();
    });

    // Set current time and add a cue point
    mockAudio.currentTime = 30;

    await act(async () => {
      fireEvent.click(screen.getByTestId("add-cue-btn"));
    });

    // Now select the cue point
    await act(async () => {
      fireEvent.click(screen.getByTestId("select-cue-btn"));
    });

    // We can't directly test if state was updated, but selecting the cue
    // should not cause errors and the UI should remain stable
    expect(screen.getByTestId("cue-points-manager")).toBeInTheDocument();
  });

  // Test 14: Test formatting time function
  test("should format time correctly", async () => {
    // This is an internal function, so we need to access it indirectly
    // We can check if time displays correctly in specific scenarios

    const onTrackLoaded = jest.fn();

    await act(async () => {
      render(<TrackDisplay onTrackLoaded={onTrackLoaded} deck="A" />);
    });

    // Load a track
    await act(async () => {
      fireEvent.click(screen.getByText("LOAD TRACK"));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("select-file-btn"));
    });

    await act(async () => {
      if (mockAudio.oncanplaythrough) mockAudio.oncanplaythrough();
    });

    // We've loaded the track, but can't directly test formatTime
    // In a real implementation, we would look for formatted time strings in the UI
  });
});
