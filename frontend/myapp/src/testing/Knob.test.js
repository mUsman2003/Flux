import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import Knob from "../components/Knob";

describe("Knob Component", () => {
  beforeEach(() => {
    // Mock clientY since it's not available in test environment
    jest
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(() => 100);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    render(<Knob label="Test Knob" />);

    // Check that the label is rendered
    expect(screen.getByText("Test Knob")).toBeInTheDocument();

    // Check that the default value is displayed
    expect(screen.getByText("0.0")).toBeInTheDocument();
  });

  it("renders with custom props", () => {
    render(
      <Knob
        label="Custom Knob"
        min={-24}
        max={24}
        defaultValue={6}
        color="#ff5500"
      />
    );

    // Check that the custom label is rendered
    expect(screen.getByText("Custom Knob")).toBeInTheDocument();

    // Check that the custom value is displayed with + sign for positive values
    expect(screen.getByText("+6.0")).toBeInTheDocument();
  });

  it("displays negative values correctly", () => {
    render(<Knob label="Negative Test" defaultValue={-6} />);

    // Check that negative values are displayed correctly
    expect(screen.getByText("-6.0")).toBeInTheDocument();
  });

  it("handles mouse interaction and updates value", () => {
    const mockOnChange = jest.fn();

    render(
      <Knob
        label="Interactive Knob"
        min={-12}
        max={12}
        defaultValue={0}
        onChange={mockOnChange}
      />
    );

    const knobElement =
      screen.getByText("Interactive Knob").parentElement.parentElement
        .firstChild;

    // Initial value should be 0.0
    expect(screen.getByText("0.0")).toBeInTheDocument();

    // Simulate mouse down
    fireEvent.mouseDown(knobElement, { clientY: 200 });

    // Simulate mouse move (moving mouse up decreases Y and increases value)
    fireEvent.mouseMove(document, { clientY: 180 });

    // Value should be updated (moving up by 20px should increase value)
    // The increase depends on the formula: (deltaY / 100) * (max - min)
    // Here: (20 / 100) * 24 = 4.8, rounded to nearest 0.5 = 5.0
    expect(screen.getByText("+5.0")).toBeInTheDocument();

    // Check that onChange was called
    expect(mockOnChange).toHaveBeenCalledWith(5);

    // Simulate mouse up to end the interaction
    fireEvent.mouseUp(document);

    // Try to move again (should have no effect as we've mouseUp)
    fireEvent.mouseMove(document, { clientY: 150 });

    // Value should still be +5.0 (not changed after mouseUp)
    expect(screen.getByText("+5.0")).toBeInTheDocument();
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it("clamps values to min/max range", () => {
    const mockOnChange = jest.fn();

    render(
      <Knob
        label="Clamped Knob"
        min={-5}
        max={5}
        defaultValue={0}
        onChange={mockOnChange}
      />
    );

    const knobElement =
      screen.getByText("Clamped Knob").parentElement.parentElement.firstChild;

    // Simulate mouse down
    fireEvent.mouseDown(knobElement, { clientY: 200 });

    // Simulate extreme mouse move that would exceed max value
    fireEvent.mouseMove(document, { clientY: 0 });

    // Value should be clamped to max (5.0)
    expect(screen.getByText("+5.0")).toBeInTheDocument();
    expect(mockOnChange).toHaveBeenCalledWith(5);

    // Now test the minimum value
    fireEvent.mouseMove(document, { clientY: 400 });

    // Value should be clamped to min (-5.0)
    expect(screen.getByText("-5.0")).toBeInTheDocument();
    expect(mockOnChange).toHaveBeenCalledWith(-5);

    fireEvent.mouseUp(document);
  });

  it("rounds values to nearest 0.5", () => {
    const mockOnChange = jest.fn();

    render(
      <Knob
        label="Rounded Knob"
        min={-10}
        max={10}
        defaultValue={0}
        onChange={mockOnChange}
      />
    );

    const knobElement =
      screen.getByText("Rounded Knob").parentElement.parentElement.firstChild;

    // Simulate mouse down
    fireEvent.mouseDown(knobElement, { clientY: 200 });

    // Simulate a mouse move that would create a non-0.5 increment value
    fireEvent.mouseMove(document, { clientY: 197 });

    // Value should be rounded to nearest 0.5
    // A move of 3px represents (3/100) * 20 = 0.6, which rounds to 0.5
    expect(screen.getByText("+0.5")).toBeInTheDocument();
    expect(mockOnChange).toHaveBeenCalledWith(0.5);

    fireEvent.mouseUp(document);
  });

  it("properly cleans up event listeners on unmount", () => {
    const mockOnChange = jest.fn();
    const addEventListenerSpy = jest.spyOn(document, "addEventListener");
    const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");

    const { unmount } = render(
      <Knob label="Cleanup Test" onChange={mockOnChange} />
    );

    const knobElement =
      screen.getByText("Cleanup Test").parentElement.parentElement.firstChild;

    // Simulate mouse down to add event listeners
    fireEvent.mouseDown(knobElement, { clientY: 200 });

    // Verify event listeners were added
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function)
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mouseup",
      expect.any(Function)
    );

    // Clear the mock to track only the remove calls after this point
    addEventListenerSpy.mockClear();
    removeEventListenerSpy.mockClear();

    // Unmount the component
    unmount();

    // Verify that removeEventListener was called for both events
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mouseup",
      expect.any(Function)
    );
  });

  it("properly handles mouse up after mouse down", () => {
    const addEventListenerSpy = jest.spyOn(document, "addEventListener");
    const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");

    render(<Knob label="Mouse Events Test" />);

    const knobElement =
      screen.getByText("Mouse Events Test").parentElement.parentElement
        .firstChild;

    // Simulate mouse down
    fireEvent.mouseDown(knobElement, { clientY: 200 });

    // Check that event listeners were added
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function)
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mouseup",
      expect.any(Function)
    );

    // Simulate mouse up
    fireEvent.mouseUp(document);

    // Check that event listeners were removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mouseup",
      expect.any(Function)
    );
  });
});
