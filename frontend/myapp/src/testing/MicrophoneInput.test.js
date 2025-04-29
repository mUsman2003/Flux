import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import MicrophoneInput from "../components/MicrophoneInput";

// Mock the MediaDevices API
const setupMediaDevicesMock = () => {
  const mockStream = {
    getTracks: jest.fn().mockReturnValue([{ stop: jest.fn() }]),
  };

  navigator.mediaDevices = {
    getUserMedia: jest.fn().mockResolvedValue(mockStream),
  };

  return mockStream;
};

// Mock the MediaRecorder API
const setupMediaRecorderMock = () => {
  let dataAvailableCallback = null;
  let stopCallback = null;

  window.MediaRecorder = jest.fn().mockImplementation(function () {
    this.start = jest.fn();
    this.stop = jest.fn().mockImplementation(() => {
      if (stopCallback) stopCallback();
    });
    this.ondataavailable = null;
    this.onstop = null;

    // Store callbacks
    Object.defineProperty(this, "ondataavailable", {
      set(callback) {
        dataAvailableCallback = callback;
      },
    });

    Object.defineProperty(this, "onstop", {
      set(callback) {
        stopCallback = callback;
      },
    });

    // Method to trigger ondataavailable callback for testing
    this.triggerDataAvailable = (data) => {
      if (dataAvailableCallback) {
        const event = { data };
        dataAvailableCallback(event);
      }
    };

    // Method to trigger onstop callback for testing
    this.triggerStop = () => {
      if (stopCallback) stopCallback();
    };
  });

  return window.MediaRecorder;
};

// Mock URL methods
const setupURLMock = () => {
  const mockURLs = new Map();
  let urlCounter = 0;

  global.URL.createObjectURL = jest.fn((blob) => {
    const url = `mock-url-${urlCounter++}`;
    mockURLs.set(url, blob);
    return url;
  });

  global.URL.revokeObjectURL = jest.fn((url) => {
    mockURLs.delete(url);
  });

  return { mockURLs };
};

describe("MicrophoneInput Component", () => {
  let mockStream;
  let mockMediaRecorder;
  let urlMock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStream = setupMediaDevicesMock();
    mockMediaRecorder = setupMediaRecorderMock();
    urlMock = setupURLMock();

    // Fix: Properly mock HTMLAudioElement and its play method
    // This is crucial as JSDOM doesn't implement play() by default
    window.HTMLMediaElement.prototype.play = jest
      .fn()
      .mockImplementation(() => {
        return Promise.resolve();
      });

    window.HTMLMediaElement.prototype.pause = jest
      .fn()
      .mockImplementation(() => {});

    // Mock Audio constructor if needed
    global.Audio = jest.fn().mockImplementation(() => {
      return {
        play: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        src: "",
        volume: 1,
      };
    });

    // Mock onended event handler
    window.HTMLMediaElement.prototype.play = jest
      .fn()
      .mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = jest.fn();
  });

  test("renders with initial state", () => {
    render(<MicrophoneInput />);

    // Check initial UI elements
    expect(screen.getByText("MIC INPUT")).toBeInTheDocument();
    expect(screen.getByText("RECORD")).toBeInTheDocument();
    expect(screen.getByText("VOL")).toBeInTheDocument();
    expect(screen.getByText("RECORDINGS")).toBeInTheDocument();
    expect(screen.getByText("No recordings yet")).toBeInTheDocument();
  });

  test("starts and stops recording", async () => {
    render(<MicrophoneInput />);

    // Start recording
    const recordButton = screen.getByText("RECORD");

    await act(async () => {
      fireEvent.click(recordButton);
    });

    // Check if getUserMedia was called
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: true,
    });

    // Check if recording state changed
    expect(screen.getByText("STOP")).toBeInTheDocument();

    // Check if MediaRecorder was created and started
    expect(window.MediaRecorder).toHaveBeenCalled();
    expect(window.MediaRecorder.mock.instances[0].start).toHaveBeenCalled();

    // Stop recording
    const stopButton = screen.getByText("STOP");

    await act(async () => {
      fireEvent.click(stopButton);
    });

    // Check if MediaRecorder was stopped
    expect(window.MediaRecorder.mock.instances[0].stop).toHaveBeenCalled();

    // Check if all tracks were stopped
    expect(mockStream.getTracks).toHaveBeenCalled();
    expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();
  });

  test("creates and displays a new recording when recording is stopped", async () => {
    render(<MicrophoneInput />);

    // Start recording
    await act(async () => {
      fireEvent.click(screen.getByText("RECORD"));
    });

    const mockInstance = window.MediaRecorder.mock.instances[0];

    // Simulate recording data
    await act(async () => {
      const mockBlob = new Blob(["test-audio-data"], { type: "audio/wav" });
      mockInstance.triggerDataAvailable(mockBlob);
    });

    // Stop recording and trigger the onstop event
    await act(async () => {
      fireEvent.click(screen.getByText("STOP"));
      mockInstance.triggerStop();
    });

    // Check if a new recording was created and displayed
    expect(screen.getByText("Input 1")).toBeInTheDocument();
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  test("plays and pauses a recording", async () => {
    render(<MicrophoneInput />);

    // Create a recording
    await act(async () => {
      fireEvent.click(screen.getByText("RECORD"));
    });

    const mockInstance = window.MediaRecorder.mock.instances[0];

    await act(async () => {
      const mockBlob = new Blob(["test-audio-data"], { type: "audio/wav" });
      mockInstance.triggerDataAvailable(mockBlob);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("STOP"));
      mockInstance.triggerStop();
    });

    // Play the recording
    await act(async () => {
      fireEvent.click(screen.getByText("Input 1"));
    });

    // Check if audio play was called
    const audioElements = document.querySelectorAll("audio");
    expect(audioElements).toHaveLength(1);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();

    // Check if the playing state is reflected
    expect(screen.getByText("▶")).toBeInTheDocument();
  });

  test("deletes a recording", async () => {
    render(<MicrophoneInput />);

    // Create a recording
    await act(async () => {
      fireEvent.click(screen.getByText("RECORD"));
    });

    const mockInstance = window.MediaRecorder.mock.instances[0];

    await act(async () => {
      const mockBlob = new Blob(["test-audio-data"], { type: "audio/wav" });
      mockInstance.triggerDataAvailable(mockBlob);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("STOP"));
      mockInstance.triggerStop();
    });

    // Delete the recording
    const deleteButton = screen.getByText("×");

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Check if the recording was removed from the list
    expect(screen.queryByText("Input 1")).not.toBeInTheDocument();
    expect(screen.getByText("No recordings yet")).toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  test("adjusts volume", async () => {
    render(<MicrophoneInput />);

    // Find the volume slider
    const volumeSlider = screen.getByRole("slider");

    // Change the volume
    await act(async () => {
      fireEvent.change(volumeSlider, { target: { value: "0.5" } });
    });

    // Create and play a recording to test if volume is applied
    await act(async () => {
      fireEvent.click(screen.getByText("RECORD"));
    });

    const mockInstance = window.MediaRecorder.mock.instances[0];

    await act(async () => {
      const mockBlob = new Blob(["test-audio-data"], { type: "audio/wav" });
      mockInstance.triggerDataAvailable(mockBlob);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("STOP"));
      mockInstance.triggerStop();
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Input 1"));
    });

    // We can't access the ref directly, but we've set the volume state to 0.5
    // The test is checking that the component doesn't crash when changing volume
    expect(volumeSlider.value).toBe("0.5");
  });

  test("cleans up resources when unmounted", async () => {
    const { unmount } = render(<MicrophoneInput />);

    // Create a recording
    await act(async () => {
      fireEvent.click(screen.getByText("RECORD"));
    });

    const mockInstance = window.MediaRecorder.mock.instances[0];

    await act(async () => {
      const mockBlob = new Blob(["test-audio-data"], { type: "audio/wav" });
      mockInstance.triggerDataAvailable(mockBlob);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("STOP"));
      mockInstance.triggerStop();
    });

    // Unmount the component
    unmount();

    // Check if URL.revokeObjectURL was called
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});
