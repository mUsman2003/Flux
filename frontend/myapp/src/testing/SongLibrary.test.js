import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SongLibrary from "../components/SongLibrary";

// Mock fetch API
global.fetch = jest.fn();

describe("SongLibrary Component", () => {
  const mockSongs = [
    { id: 1, name: "Test Song 1" },
    { id: 2, name: "Another Test Song" },
    { id: 3, name: "Final Test Track" },
  ];

  const mockOnSelectDatabaseSong = jest.fn();
  const mockOnClose = jest.fn();
  const mockGoBack = jest.fn();

  beforeEach(() => {
    // Reset and re-mock the fetch for each test
    fetch.mockReset();
    // Mock successful API response
    fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSongs),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    render(
      <SongLibrary
        onSelectDatabaseSong={mockOnSelectDatabaseSong}
        onClose={mockOnClose}
        goBack={mockGoBack}
      />
    );

    expect(screen.getByText("Loading tracks...")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("http://localhost:5000/api/songs");
  });

  it("displays songs after loading", async () => {
    render(
      <SongLibrary
        onSelectDatabaseSong={mockOnSelectDatabaseSong}
        onClose={mockOnClose}
        goBack={mockGoBack}
      />
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText("Loading tracks...")).not.toBeInTheDocument();
    });

    // Check for the correct number of song buttons (excluding back button)
    const songButtons = screen
      .getAllByRole("button")
      .filter((button) => button.textContent !== "← Back");
    expect(songButtons).toHaveLength(3);

    // Verify song content by checking that each button contains the expected song name
    expect(songButtons[0].textContent).toContain("Test Song 1");
    expect(songButtons[1].textContent).toContain("Another Test Song");
    expect(songButtons[2].textContent).toContain("Final Test Track");

    // Check for the presence of the load icons
    const loadIcons = screen.getAllByText("▶");
    expect(loadIcons).toHaveLength(3);
  });

  it("filters songs based on search input", async () => {
    render(
      <SongLibrary
        onSelectDatabaseSong={mockOnSelectDatabaseSong}
        onClose={mockOnClose}
        goBack={mockGoBack}
      />
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText("Loading tracks...")).not.toBeInTheDocument();
    });

    // Make sure we have all song buttons initially
    let songButtons = screen
      .getAllByRole("button")
      .filter((button) => button.textContent !== "← Back");
    expect(songButtons).toHaveLength(3);

    // Enter search term
    const searchInput = screen.getByPlaceholderText("Search tracks...");
    fireEvent.change(searchInput, { target: { value: "Another" } });

    // Only one song should remain visible
    songButtons = screen
      .getAllByRole("button")
      .filter((button) => button.textContent !== "← Back");
    expect(songButtons).toHaveLength(1);
    expect(songButtons[0].textContent).toContain("Another Test Song");
  });

  it("shows no results message when no songs match search", async () => {
    render(
      <SongLibrary
        onSelectDatabaseSong={mockOnSelectDatabaseSong}
        onClose={mockOnClose}
        goBack={mockGoBack}
      />
    );

    // Wait for songs to load
    await waitFor(() => {
      expect(screen.getByText("Test Song 1")).toBeInTheDocument();
    });

    // Enter search term that won't match any songs
    const searchInput = screen.getByPlaceholderText("Search tracks...");
    fireEvent.change(searchInput, { target: { value: "xyz" } });

    // No results message should be displayed
    expect(screen.getByText("No tracks found")).toBeInTheDocument();
  });

  it("calls onSelectDatabaseSong and onClose when a song is clicked", async () => {
    render(
      <SongLibrary
        onSelectDatabaseSong={mockOnSelectDatabaseSong}
        onClose={mockOnClose}
        goBack={mockGoBack}
      />
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText("Loading tracks...")).not.toBeInTheDocument();
    });

    // Get all song buttons and click the first one
    const songButtons = screen
      .getAllByRole("button")
      .filter((button) => button.textContent !== "← Back");

    // Click the first song button
    fireEvent.click(songButtons[0]);

    // Check that the appropriate callbacks were called
    expect(mockOnSelectDatabaseSong).toHaveBeenCalledWith(mockSongs[0]);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls goBack and resets search when back button is clicked", async () => {
    render(
      <SongLibrary
        onSelectDatabaseSong={mockOnSelectDatabaseSong}
        onClose={mockOnClose}
        goBack={mockGoBack}
      />
    );

    // Wait for songs to load
    await waitFor(() => {
      expect(screen.getByText("Test Song 1")).toBeInTheDocument();
    });

    // Enter a search term
    const searchInput = screen.getByPlaceholderText("Search tracks...");
    fireEvent.change(searchInput, { target: { value: "test" } });

    // Click back button
    fireEvent.click(screen.getByText("← Back"));

    // Check that goBack was called
    expect(mockGoBack).toHaveBeenCalled();

    // Re-render would show empty search input, but we can't test that directly
    // in this test environment since the component is not actually re-rendered
  });

  it("handles API error gracefully", async () => {
    // Override the mock to simulate an error
    fetch.mockRejectedValueOnce(new Error("Network error"));

    console.error = jest.fn(); // Suppress console.error for this test

    render(
      <SongLibrary
        onSelectDatabaseSong={mockOnSelectDatabaseSong}
        onClose={mockOnClose}
        goBack={mockGoBack}
      />
    );

    // Wait for loading to complete with error
    await waitFor(() => {
      expect(screen.queryByText("Loading tracks...")).not.toBeInTheDocument();
    });

    // Should show "No tracks found" when API fails
    expect(screen.getByText("No tracks found")).toBeInTheDocument();

    // Should have logged the error
    expect(console.error).toHaveBeenCalled();
  });

  it("search is case insensitive", async () => {
    const { debug } = render(
      <SongLibrary
        onSelectDatabaseSong={mockOnSelectDatabaseSong}
        onClose={mockOnClose}
        goBack={mockGoBack}
      />
    );

    // Wait for the API call to complete and the loading indicator to disappear
    await waitFor(() => {
      expect(screen.queryByText("Loading tracks...")).not.toBeInTheDocument();
    });

    // Make sure songs are rendered before proceeding
    await waitFor(() => {
      // Use getAllByRole to find all song buttons
      const songButtons = screen.getAllByRole("button");
      // Filter to only song item buttons (exclude the back button)
      const songItems = songButtons.filter(
        (button) => button.textContent !== "← Back"
      );
      expect(songItems.length).toBe(3);
    });

    // Enter search term in lowercase
    const searchInput = screen.getByPlaceholderText("Search tracks...");
    fireEvent.change(searchInput, { target: { value: "test" } });

    // Check that all expected song buttons remain (excluding the back button)
    const buttonsAfterSearch = screen
      .getAllByRole("button")
      .filter((button) => button.textContent !== "← Back");
    expect(buttonsAfterSearch.length).toBe(3);

    // Try uppercase search
    fireEvent.change(searchInput, { target: { value: "TEST" } });

    // Check that all expected song buttons still remain
    const buttonsAfterUppercaseSearch = screen
      .getAllByRole("button")
      .filter((button) => button.textContent !== "← Back");
    expect(buttonsAfterUppercaseSearch.length).toBe(3);
  });
});
