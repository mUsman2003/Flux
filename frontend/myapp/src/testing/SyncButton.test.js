import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SyncButton from "../components/SyncButton";

describe("SyncButton Component", () => {
  let mockMasterDeck;
  let mockSlaveDeck;
  let mockTempoRef;

  beforeEach(() => {
    // Mock deck references with playback properties
    mockMasterDeck = {
      current: {
        playbackRate: 1.0,
        paused: true,
        play: jest.fn(),
      },
    };

    mockSlaveDeck = {
      current: {
        playbackRate: 1.0,
        paused: true,
        play: jest.fn(),
      },
    };

    mockTempoRef = {
      current: {
        value: 1.0,
        dispatchEvent: jest.fn(),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders with inactive state by default", () => {
    render(
      <SyncButton masterDeck={mockMasterDeck} slaveDeck={mockSlaveDeck} />
    );

    const button = screen.getByRole("button", { name: /SYNC/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle("backgroundColor: #333");
    expect(button).not.toHaveStyle("boxShadow: 0 0 15px #00c6ff90");
  });

  it("changes to active state when clicked", () => {
    render(
      <SyncButton masterDeck={mockMasterDeck} slaveDeck={mockSlaveDeck} />
    );

    const button = screen.getByRole("button", { name: /SYNC/i });
    fireEvent.click(button);

    expect(button).toHaveStyle("backgroundColor: #00c6ff");
    expect(button).toHaveStyle("boxShadow: 0 0 15px #00c6ff90");
  });

  it("synchronizes playback rates between decks when activated", () => {
    // Set different playback rates initially
    mockMasterDeck.current.playbackRate = 1.2;
    mockSlaveDeck.current.playbackRate = 1.0;

    render(
      <SyncButton masterDeck={mockMasterDeck} slaveDeck={mockSlaveDeck} />
    );

    const button = screen.getByRole("button", { name: /SYNC/i });
    fireEvent.click(button);

    // Slave deck's playback rate should match master deck's
    expect(mockSlaveDeck.current.playbackRate).toBe(1.2);
  });

  it("updates tempo slider when syncing", () => {
    mockMasterDeck.current.playbackRate = 1.5;

    render(
      <SyncButton
        masterDeck={mockMasterDeck}
        slaveDeck={mockSlaveDeck}
        tempoRef={mockTempoRef}
      />
    );

    const button = screen.getByRole("button", { name: /SYNC/i });
    fireEvent.click(button);

    // Tempo slider value should be updated
    expect(mockTempoRef.current.value).toBe(1.5);

    // Should dispatch events
    expect(mockTempoRef.current.dispatchEvent).toHaveBeenCalledTimes(2);
  });

  it("starts playback of slave deck if master is playing", () => {
    // Master deck is playing, slave deck is paused
    mockMasterDeck.current.paused = false;
    mockSlaveDeck.current.paused = true;

    render(
      <SyncButton masterDeck={mockMasterDeck} slaveDeck={mockSlaveDeck} />
    );

    const button = screen.getByRole("button", { name: /SYNC/i });
    fireEvent.click(button);

    // Should start playback of slave deck
    expect(mockSlaveDeck.current.play).toHaveBeenCalled();
  });

  it("does not start playback if master deck is also paused", () => {
    // Both decks are paused
    mockMasterDeck.current.paused = true;
    mockSlaveDeck.current.paused = true;

    render(
      <SyncButton masterDeck={mockMasterDeck} slaveDeck={mockSlaveDeck} />
    );

    const button = screen.getByRole("button", { name: /SYNC/i });
    fireEvent.click(button);

    // Should not start playback of slave deck
    expect(mockSlaveDeck.current.play).not.toHaveBeenCalled();
  });

  it("disables the button when decks are not available", () => {
    // Render without decks
    render(<SyncButton />);

    const button = screen.getByRole("button", { name: /SYNC/i });
    expect(button).toBeDisabled();
  });

  it("disables the button when only master deck is available", () => {
    render(<SyncButton masterDeck={mockMasterDeck} />);

    const button = screen.getByRole("button", { name: /SYNC/i });
    expect(button).toBeDisabled();
  });

  it("disables the button when only slave deck is available", () => {
    render(<SyncButton slaveDeck={mockSlaveDeck} />);

    const button = screen.getByRole("button", { name: /SYNC/i });
    expect(button).toBeDisabled();
  });

  it("enables the button when both decks are available", () => {
    render(
      <SyncButton masterDeck={mockMasterDeck} slaveDeck={mockSlaveDeck} />
    );

    const button = screen.getByRole("button", { name: /SYNC/i });
    expect(button).not.toBeDisabled();
  });

  it("deactivates sync when a deck is removed", () => {
    const { rerender } = render(
      <SyncButton masterDeck={mockMasterDeck} slaveDeck={mockSlaveDeck} />
    );

    // Activate sync
    const button = screen.getByRole("button", { name: /SYNC/i });
    fireEvent.click(button);

    // Verify sync is active
    expect(button).toHaveStyle("backgroundColor: #00c6ff");

    // Remove slave deck
    rerender(<SyncButton masterDeck={mockMasterDeck} slaveDeck={null} />);

    // Sync should be deactivated
    const updatedButton = screen.getByRole("button", { name: /SYNC/i });
    expect(updatedButton).toHaveStyle("backgroundColor: #333");
    expect(updatedButton).toBeDisabled();
  });

  it("does nothing when clicked in inactive state", () => {
    render(
      <SyncButton masterDeck={mockMasterDeck} slaveDeck={mockSlaveDeck} />
    );

    // Click once to activate
    const button = screen.getByRole("button", { name: /SYNC/i });
    fireEvent.click(button);

    // Reset mocks to check for new calls
    mockSlaveDeck.current.play.mockClear();
    mockTempoRef.current.dispatchEvent.mockClear();

    // Click again to deactivate
    fireEvent.click(button);

    // Should not trigger any playback or sync actions
    expect(mockSlaveDeck.current.play).not.toHaveBeenCalled();
    expect(mockTempoRef.current.dispatchEvent).not.toHaveBeenCalled();
  });
});
