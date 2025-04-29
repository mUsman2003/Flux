import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VolumeSlider from '../components/VolumeSlider';

describe('VolumeSlider Component', () => {
  let mockAudioRef;
  
  beforeEach(() => {
    // Mock audio reference with volume
    mockAudioRef = {
      current: {
        volume: 1.0
      }
    };
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders with default volume of 20%', () => {
    render(<VolumeSlider audioRef={mockAudioRef} />);
    
    expect(screen.getByText('VOL')).toBeInTheDocument();
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('20');
    
    // Check that the fader fill height matches 20%
    const faderFill = screen.getByTestId('fader-fill');
    expect(faderFill).toHaveStyle('height: 20%');
  });
  
  it('initializes audio volume to 20% of original volume', () => {
    mockAudioRef.current.volume = 0.8; // Original volume
    
    render(<VolumeSlider audioRef={mockAudioRef} />);
    
    // Should set audio volume to 20% of 0.8 = 0.16
    expect(mockAudioRef.current.volume).toBeCloseTo(0.16);
  });
  
  it('updates volume when slider is moved', () => {
    mockAudioRef.current.volume = 1.0;
    render(<VolumeSlider audioRef={mockAudioRef} />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '50' } });
    
    // Should set volume to 50% of original volume 1.0 = 0.5
    expect(mockAudioRef.current.volume).toBeCloseTo(0.5);
    
    // Check that the fader fill height updates
    const faderFill = screen.getByTestId('fader-fill');
    expect(faderFill).toHaveStyle('height: 50%');
  });
  
  it('uses blue accent color for left side', () => {
    render(<VolumeSlider audioRef={mockAudioRef} side="left" />);
    
    const faderFill = screen.getByTestId('fader-fill');
    expect(faderFill).toHaveStyle('backgroundColor: #4095e5');
  });
  
  it('uses red accent color for right side', () => {
    render(<VolumeSlider audioRef={mockAudioRef} side="right" />);
    
    const faderFill = screen.getByTestId('fader-fill');
    expect(faderFill).toHaveStyle('backgroundColor: #e5405e');
  });
  
  it('handles volume range from 0 to 90', () => {
    render(<VolumeSlider audioRef={mockAudioRef} />);
    const slider = screen.getByRole('slider');
    
    // Check min value
    fireEvent.change(slider, { target: { value: '0' } });
    expect(mockAudioRef.current.volume).toBeCloseTo(0);
    const faderFillMin = screen.getByTestId('fader-fill');
    expect(faderFillMin).toHaveStyle('height: 0%');
    
    // Check max value
    fireEvent.change(slider, { target: { value: '90' } });
    expect(mockAudioRef.current.volume).toBeCloseTo(0.9);
    const faderFillMax = screen.getByTestId('fader-fill');
    expect(faderFillMax).toHaveStyle('height: 90%');
  });
  
  it('handles missing audioRef gracefully', () => {
    render(<VolumeSlider />);
    
    const slider = screen.getByRole('slider');
    // Should not throw error when changing slider without audioRef
    expect(() => {
      fireEvent.change(slider, { target: { value: '50' } });
    }).not.toThrow();
    
    const faderFill = screen.getByTestId('fader-fill');
    expect(faderFill).toHaveStyle('height: 50%');
  });
  
  it('preserves original volume when adjusting', () => {
    mockAudioRef.current.volume = 0.8; // Original volume
    
    render(<VolumeSlider audioRef={mockAudioRef} />);
    
    // Initial volume should be 20% of original
    expect(mockAudioRef.current.volume).toBeCloseTo(0.16);
    
    // Change to 50%
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '50' } });
    
    // Should be 50% of original 0.8 = 0.4
    expect(mockAudioRef.current.volume).toBeCloseTo(0.4);
  });
});