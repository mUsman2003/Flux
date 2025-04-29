import React from "react";
import { render, fireEvent, screen, act } from "@testing-library/react";
import RecordingButton from "../components/RecordingButton";

// Create a mock implementation for mediaRecorder
let mockMediaRecorderInstance = {
  mimeType: "audio/webm;codecs=opus",
  ondataavailable: null,
  onstop: null,
  start: jest.fn(),
  stop: jest.fn().mockImplementation(() => Promise.resolve()),
};

// Mock global MediaStream
global.MediaStream = class {
  constructor() {
    this.id = "mock-stream";
    this.active = true;
  }
};

// Mock window.alert
global.alert = jest.fn();

// Mock MediaRecorder with a proper implementation
global.MediaRecorder = jest.fn().mockImplementation(() => {
  return mockMediaRecorderInstance;
});

// Define the static method properly outside the class definition
global.MediaRecorder.isTypeSupported = jest.fn().mockReturnValue(true);

// Mock Blob since it might be used in the recording process
global.Blob = class {
  constructor(data, options) {
    this.data = data;
    this.options = options;
    this.size = 1024;
    this.type = options?.type || "";
  }
};

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn().mockReturnValue("mock-url");
global.URL.revokeObjectURL = jest.fn();

describe("RecordingButton Component", () => {
  let deckA, deckB;

  beforeEach(() => {
    // Reset the media recorder instance for each test
    mockMediaRecorderInstance = {
      mimeType: "audio/webm;codecs=opus",
      ondataavailable: null,
      onstop: null,
      start: jest.fn(),
      stop: jest.fn().mockImplementation(() => Promise.resolve()),
    };

    deckA = { current: document.createElement("audio") };
    deckB = { current: document.createElement("audio") };

    // Mock captureStream to prevent errors
    deckA.current.captureStream = jest.fn(() => new MediaStream());
    deckB.current.captureStream = jest.fn(() => new MediaStream());

    // Create play and pause methods for audio elements
    deckA.current.play = jest.fn().mockImplementation(() => Promise.resolve());
    deckA.current.pause = jest.fn();
    deckB.current.play = jest.fn().mockImplementation(() => Promise.resolve());
    deckB.current.pause = jest.fn();

    // Mock AudioContext
    window.AudioContext = jest.fn().mockImplementation(() => ({
      createMediaStreamDestination: () => ({
        stream: new MediaStream(),
      }),
      createGain: () => ({
        connect: jest.fn(),
        gain: { value: 1 },
      }),
      createMediaStreamSource: () => ({
        connect: jest.fn(),
      }),
      createMediaElementSource: () => ({
        connect: jest.fn(),
      }),
      // Ensure close method returns a mockable Promise
      close: jest.fn().mockImplementation(() => Promise.resolve()),
      destination: {},
    }));

    // Reset the static method mock before each test
    global.MediaRecorder.isTypeSupported.mockClear();
    global.MediaRecorder.isTypeSupported.mockReturnValue(true);

    // Reset the alert mock before each test
    global.alert.mockClear();

    // Mock timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it("renders correctly with initial state", () => {
    render(<RecordingButton deckA={deckA} deckB={deckB} />);
    expect(screen.getByText("RECORDING")).toBeInTheDocument();
    expect(screen.getByText("REC")).toBeInTheDocument();
    expect(screen.getByText("Ready to Record")).toBeInTheDocument();
  });

  it("disables REC button if decks are missing", () => {
    render(<RecordingButton deckA={null} deckB={null} />);
    expect(screen.getByText("REC")).toBeDisabled();
  });

  it("toggles microphone checkbox", () => {
    render(<RecordingButton deckA={deckA} deckB={deckB} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("starts recording when REC is clicked", async () => {
    render(<RecordingButton deckA={deckA} deckB={deckB} />);
    const recButton = screen.getByText("REC");

    await act(async () => {
      fireEvent.click(recButton);
      // Manually trigger ondataavailable if needed
      if (mockMediaRecorderInstance.ondataavailable) {
        mockMediaRecorderInstance.ondataavailable({ data: new Blob() });
      }
    });

    expect(screen.getByText(/REC 0:0\d/)).toBeInTheDocument();
  });

  it("stops recording when STOP is clicked", async () => {
    render(<RecordingButton deckA={deckA} deckB={deckB} />);

    // Start recording
    await act(async () => {
      fireEvent.click(screen.getByText("REC"));
      // Manually trigger ondataavailable if needed
      if (mockMediaRecorderInstance.ondataavailable) {
        mockMediaRecorderInstance.ondataavailable({ data: new Blob() });
      }
    });

    // Verify recording started
    const stopButton = await screen.findByText("STOP");

    // Stop recording
    await act(async () => {
      fireEvent.click(stopButton);
      // Manually trigger onstop if it exists
      if (mockMediaRecorderInstance.onstop) {
        mockMediaRecorderInstance.onstop();
      }
    });

    expect(screen.getByText("Ready: 0:00")).toBeInTheDocument();
  });

  it("handles codec not supported scenario", async () => {
    // Mock isTypeSupported to return false for this test
    global.MediaRecorder.isTypeSupported.mockReturnValue(false);

    // Throw an error when trying to create a MediaRecorder with unsupported codec
    global.MediaRecorder.mockImplementationOnce(() => {
      throw new Error("codec not supported");
    });

    render(<RecordingButton deckA={deckA} deckB={deckB} />);
    const recButton = screen.getByText("REC");

    await act(async () => {
      fireEvent.click(recButton);
    });

    expect(global.alert).toHaveBeenCalledWith(
      expect.stringContaining("Could not start recording: codec not supported")
    );
  });
});
