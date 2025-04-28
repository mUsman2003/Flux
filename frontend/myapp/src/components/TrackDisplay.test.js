import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TrackDisplay from "./TrackDisplay";

// Mock the necessary components or modules if needed
jest.mock("./AddSongModal", () => {
  return function MockAddSongModal({ onClose, onSelectFile, onSelectDatabaseSong }) {
    return (
      <div data-testid="add-song-modal">
        <button data-testid="close-modal" onClick={onClose}>Close Modal</button>
        <input
          type="file"
          data-testid="file-input"
          onChange={(e) => {
            if (e.target.files.length > 0) {
              onSelectFile(e.target.files[0]);
              onClose();
            }
          }}
        />
        <button 
          data-testid="select-database-song" 
          onClick={() => {
            onSelectDatabaseSong({ 
              id: 1, 
              name: "Test Database Song", 
              path: "/test-path" 
            });
            onClose();
          }}
        >
          Select Database Song
        </button>
      </div>
    );
  };
});

// Mock audio functionality
const mockAudio = {
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

beforeAll(() => {
  // Mock URL.createObjectURL to prevent errors in Jest testing environment
  global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/fake-url');
  global.URL.revokeObjectURL = jest.fn();
  
  // Mock Audio constructor
  window.Audio = jest.fn().mockImplementation(() => {
    return {
      ...mockAudio,
      play: jest.fn().mockResolvedValue(undefined),
      load: jest.fn(),
      pause: jest.fn(),
    };
  });
});

describe("TrackDisplay Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch for database song selection
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: jest.fn().mockResolvedValue(new Blob([''], { type: 'audio/mp3' }))
    });
  });

  test("should render 'LOAD TRACK' button and open modal", async () => {
    render(<TrackDisplay onTrackLoaded={jest.fn()} deck="deck1" />);

    // Ensure 'LOAD TRACK' button is displayed
    const loadTrackButton = screen.getByText("LOAD TRACK");
    expect(loadTrackButton).toBeInTheDocument();

    // Simulate clicking the 'LOAD TRACK' button to show the modal
    fireEvent.click(loadTrackButton);

    // Ensure the modal is rendered
    expect(screen.getByTestId("add-song-modal")).toBeInTheDocument();
    expect(screen.getByText("Close Modal")).toBeInTheDocument();
  });

  test("should handle file selection correctly", async () => {
    const onTrackLoadedMock = jest.fn();
    render(<TrackDisplay onTrackLoaded={onTrackLoadedMock} deck="deck1" />);

    // Open the modal by clicking the 'LOAD TRACK' button
    fireEvent.click(screen.getByText("LOAD TRACK"));

    // Wait for the modal to be rendered
    await waitFor(() => screen.getByTestId("add-song-modal"));

    // Select the file input and simulate file selection
    const fileInput = screen.getByTestId("file-input");
    const file = new File(["track"], "track.mp3", { type: "audio/mp3" });

    // Simulate the change event with a file
    fireEvent.change(fileInput, { target: { files: [file] } });

    // The modal should close after file selection
    await waitFor(() => {
      expect(screen.queryByTestId("add-song-modal")).not.toBeInTheDocument();
    });
    
    // Check that URL.createObjectURL was called with the file
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test("should handle database song selection", async () => {
    const onTrackLoadedMock = jest.fn();
    render(<TrackDisplay onTrackLoaded={onTrackLoadedMock} deck="deck1" />);

    // Open the modal by clicking the 'LOAD TRACK' button
    fireEvent.click(screen.getByText("LOAD TRACK"));

    // Wait for the modal to be rendered
    await waitFor(() => screen.getByTestId("add-song-modal"));

    // Click on the database song selection button
    const selectDbButton = screen.getByTestId("select-database-song");
    fireEvent.click(selectDbButton);

    // Verify that fetch was called
    expect(fetch).toHaveBeenCalledWith("http://localhost:5000/api/songs/1/file");
    
    // Wait for the async operations to complete
    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  test("should not crash if no file is selected", () => {
    render(<TrackDisplay onTrackLoaded={jest.fn()} deck="deck1" />);

    // Open the modal by clicking the 'LOAD TRACK' button
    fireEvent.click(screen.getByText("LOAD TRACK"));

    // Check if the modal can be closed without selecting a file
    fireEvent.click(screen.getByTestId("close-modal"));

    // Ensure the modal closes and no crash occurs
    expect(screen.queryByTestId("add-song-modal")).not.toBeInTheDocument();
  });
});