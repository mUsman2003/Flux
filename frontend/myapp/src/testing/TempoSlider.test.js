import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TempoSlider from '../components/TempoSlider';

describe('TempoSlider Component', () => {
  let mockAudioRef;
  let mockTempoRef;
  
  beforeEach(() => {
    // Mock audio reference with playbackRate
    mockAudioRef = {
      current: {
        playbackRate: 1.0
      }
    };
    
    mockTempoRef = { current: null };
    
    // Mock setInterval and clearInterval
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });
  
  it('renders with default tempo of 1.0', () => {
    render(<TempoSlider audioRef={mockAudioRef} />);
    
    expect(screen.getByText('TEMPO')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('1');
  });
  
  it('updates tempo when slider is moved', () => {
    render(<TempoSlider audioRef={mockAudioRef} />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '1.5' } });
    
    expect(mockAudioRef.current.playbackRate).toBe(1.5);
    expect(screen.getByText('150%')).toBeInTheDocument();
  });
  
  it('initializes with audio playbackRate if available', () => {
    mockAudioRef.current.playbackRate = 1.25;
    
    render(<TempoSlider audioRef={mockAudioRef} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('1.25');
    expect(screen.getByText('125%')).toBeInTheDocument();
  });
  
  it('updates tempo when audio playbackRate changes externally', () => {
    render(<TempoSlider audioRef={mockAudioRef} />);
    
    // Initial check
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    // Simulate external change to playbackRate
    act(() => {
      mockAudioRef.current.playbackRate = 0.75;
      jest.advanceTimersByTime(300); // Beyond the 200ms polling interval
    });
    
    // Verify UI updated
    expect(screen.getByText('75%')).toBeInTheDocument();
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('0.75');
  });
  
  it('handles valid tempo range between 0.5 and 2.0', () => {
    render(<TempoSlider audioRef={mockAudioRef} />);
    const slider = screen.getByRole('slider');
    
    // Check min value
    fireEvent.change(slider, { target: { value: '0.5' } });
    expect(mockAudioRef.current.playbackRate).toBe(0.5);
    expect(screen.getByText('50%')).toBeInTheDocument();
    
    // Check max value
    fireEvent.change(slider, { target: { value: '2' } });
    expect(mockAudioRef.current.playbackRate).toBe(2);
    expect(screen.getByText('200%')).toBeInTheDocument();
  });
  
  it('assigns slider DOM element to tempoRef if provided', () => {
    render(<TempoSlider audioRef={mockAudioRef} tempoRef={mockTempoRef} />);
    
    expect(mockTempoRef.current).not.toBeNull();
    expect(mockTempoRef.current.type).toBe('range');
  });
  
  it('handles missing audioRef gracefully', () => {
    render(<TempoSlider />);
    
    const slider = screen.getByRole('slider');
    // Should not throw error when changing slider without audioRef
    expect(() => {
      fireEvent.change(slider, { target: { value: '1.5' } });
    }).not.toThrow();
    
    expect(screen.getByText('150%')).toBeInTheDocument();
  });
  
  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    const { unmount } = render(<TempoSlider audioRef={mockAudioRef} />);
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});