import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddSongModal from "../components/AddSongModal";
import SongLibrary from "../components/SongLibrary";
import CuePointsManager from "../components/CuePointsManager";

// Mock the child components
jest.mock("../components/SongLibrary", () => {
  return jest.fn(() => <div data-testid="song-library">Song Library Mock</div>);
});

jest.mock("../components/CuePointsManager", () => {
  return jest.fn(() => (
    <div data-testid="cue-points-manager">Cue Points Manager Mock</div>
  ));
});

describe("AddSongModal Component", () => {
  const mockOnClose = jest.fn();
  const mockOnSelectFile = jest.fn();
  const mockOnSelectDatabaseSong = jest.fn();
  let mockDeckRef;

  beforeEach(() => {
    mockDeckRef = {
      current: {
        volume: 1.0,
        time: 30,
      },
    };

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("renders modal with upload and library options", () => {
    render(
      <AddSongModal
        onClose={mockOnClose}
        onSelectFile={mockOnSelectFile}
        onSelectDatabaseSong={mockOnSelectDatabaseSong}
        deck={mockDeckRef}
      />
    );

    // Check that the title is displayed
    expect(screen.getByText("ADD TRACK")).toBeInTheDocument();

    // Check that both option buttons are rendered
    expect(screen.getByText("Upload Track")).toBeInTheDocument();
    expect(screen.getByText("Track Library")).toBeInTheDocument();

    // Check that the description text is displayed
    expect(screen.getByText("From your computer")).toBeInTheDocument();
    expect(screen.getByText("Choose from database")).toBeInTheDocument();

    // Check that the CuePointsManager component is rendered
    expect(screen.getByTestId("cue-points-manager")).toBeInTheDocument();
  });

  it("closes modal when close button is clicked", () => {
    render(
      <AddSongModal
        onClose={mockOnClose}
        onSelectFile={mockOnSelectFile}
        onSelectDatabaseSong={mockOnSelectDatabaseSong}
      />
    );

    const closeButton = screen.getByText("×");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("handles file selection correctly", () => {
    render(
      <AddSongModal
        onClose={mockOnClose}
        onSelectFile={mockOnSelectFile}
        onSelectDatabaseSong={mockOnSelectDatabaseSong}
      />
    );

    // Create a mock file
    const file = new File(["dummy content"], "test-song.mp3", {
      type: "audio/mp3",
    });

    // Get the hidden file input
    const fileInput = screen.getByTestId("file-input");

    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Check that the onSelectFile callback was called with the file
    expect(mockOnSelectFile).toHaveBeenCalledWith(file);

    // Check that the modal was closed
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("switches to SongLibrary view when Track Library option is clicked", () => {
    render(
      <AddSongModal
        onClose={mockOnClose}
        onSelectFile={mockOnSelectFile}
        onSelectDatabaseSong={mockOnSelectDatabaseSong}
      />
    );

    // Click the Track Library button
    const libraryButton = screen.getByText("Track Library");
    fireEvent.click(libraryButton);

    // Check that the SongLibrary component is now rendered
    expect(screen.getByTestId("song-library")).toBeInTheDocument();

    // The upload button should no longer be visible
    expect(screen.queryByText("Upload Track")).not.toBeInTheDocument();
  });

  it("passes the correct props to CuePointsManager", () => {
    render(
      <AddSongModal
        onClose={mockOnClose}
        onSelectFile={mockOnSelectFile}
        onSelectDatabaseSong={mockOnSelectDatabaseSong}
      />
    );

    // Verify the CuePointsManager was called with the expected initial props
    expect(CuePointsManager).toHaveBeenCalledWith(
      expect.objectContaining({
        cuePoints: [],
        selectedCue: null,
        crossfaderValue: 50,
      }),
      expect.anything()
    );
  });

  it("correctly handles crossfade between two decks", () => {
    const mockDeckA = {
      current: {
        volume: 0.8,
        time: 10,
      },
    };

    const mockDeckB = {
      current: {
        volume: 0.6,
        time: 20,
      },
    };

    // Access the handleCrossfade function directly by rendering the component
    // and extracting the props passed to CuePointsManager
    render(
      <AddSongModal
        onClose={mockOnClose}
        onSelectFile={mockOnSelectFile}
        onSelectDatabaseSong={mockOnSelectDatabaseSong}
        deck={mockDeckA}
      />
    );

    // Get the handleCrossfade function from the props passed to CuePointsManager
    const handleCrossfadeFn = CuePointsManager.mock.calls[0][0].handleCrossfade;

    // Test middle position (50) - both decks should play at their original volumes
    handleCrossfadeFn(50, mockDeckA, mockDeckB);
    expect(mockDeckA.current.volume).toBeCloseTo(0.8);
    expect(mockDeckB.current.volume).toBeCloseTo(0.6);

    // Test left position (0) - only deckA should play at full volume
    handleCrossfadeFn(0, mockDeckA, mockDeckB);
    expect(mockDeckA.current.volume).toBeCloseTo(0.8);
    expect(mockDeckB.current.volume).toBeCloseTo(0);

    // Test right position (100) - only deckB should play at full volume
    handleCrossfadeFn(100, mockDeckA, mockDeckB);
    expect(mockDeckA.current.volume).toBeCloseTo(0);
    expect(mockDeckB.current.volume).toBeCloseTo(0.6);

    // Test 25% position - deckA at full volume, deckB at half volume
    handleCrossfadeFn(25, mockDeckA, mockDeckB);
    expect(mockDeckA.current.volume).toBeCloseTo(0.8);
    expect(mockDeckB.current.volume).toBeCloseTo(0.3);

    // Test 75% position - deckA at half volume, deckB at full volume
    handleCrossfadeFn(75, mockDeckA, mockDeckB);
    expect(mockDeckA.current.volume).toBeCloseTo(0.4);
    expect(mockDeckB.current.volume).toBeCloseTo(0.6);
  });

  it("adds a cue point correctly", () => {
    render(
      <AddSongModal
        onClose={mockOnClose}
        onSelectFile={mockOnSelectFile}
        onSelectDatabaseSong={mockOnSelectDatabaseSong}
      />
    );

    // Get the addCuePoint function from the props passed to CuePointsManager
    const addCuePointFn = CuePointsManager.mock.calls[0][0].addCuePoint;

    // Add a cue point at time 30
    addCuePointFn(30);

    // Now check that the CuePointsManager was called with updated props
    // We need to check the most recent call to CuePointsManager
    const lastCall =
      CuePointsManager.mock.calls[CuePointsManager.mock.calls.length - 1];

    // Check that the cuePoints array contains the new point
    expect(lastCall[0].cuePoints).toEqual([{ label: "CUE 1", time: 30 }]);

    // Check that the selected cue is set to the first cue (index 0)
    expect(lastCall[0].selectedCue).toBe(0);

    // Add another cue point
    addCuePointFn(45);

    // Get the latest call
    const finalCall =
      CuePointsManager.mock.calls[CuePointsManager.mock.calls.length - 1];

    // Check that both cue points are present
    expect(finalCall[0].cuePoints).toEqual([
      { label: "CUE 1", time: 30 },
      { label: "CUE 2", time: 45 },
    ]);

    // Check that the selected cue is set to the second cue (index 1)
    expect(finalCall[0].selectedCue).toBe(1);
  });

  it("passes the right props to SongLibrary when rendered", () => {
    render(
      <AddSongModal
        onClose={mockOnClose}
        onSelectFile={mockOnSelectFile}
        onSelectDatabaseSong={mockOnSelectDatabaseSong}
      />
    );

    // Click the Track Library button to show SongLibrary
    const libraryButton = screen.getByText("Track Library");
    fireEvent.click(libraryButton);

    // Check that SongLibrary was called with the right props
    expect(SongLibrary).toHaveBeenCalledWith(
      expect.objectContaining({
        onSelectDatabaseSong: mockOnSelectDatabaseSong,
        onClose: mockOnClose,
        goBack: expect.any(Function),
      }),
      expect.anything()
    );
  });
});
