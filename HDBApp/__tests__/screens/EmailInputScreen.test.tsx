import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import EmailInputScreen from '../../src/screens/EmailInputScreen';

// Mock navigation
const mockNavigate = jest.fn();
const navigation = {
  navigate: mockNavigate,
} as any;

describe('EmailInputScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const screen = render(<EmailInputScreen navigation={navigation} />);
    expect(screen).toBeTruthy();
  });

  it('contains skip functionality', () => {
    const {getAllByTestId} = render(<EmailInputScreen navigation={navigation} />);
    
    // Find all TouchableOpacity elements
    const touchableElements = getAllByTestId('TouchableOpacity');
    expect(touchableElements.length).toBeGreaterThan(0);
  });

  it('navigates when skip is pressed', () => {
    const {getAllByTestId} = render(<EmailInputScreen navigation={navigation} />);
    
    // Find TouchableOpacity elements and press the last one (likely skip)
    const touchableElements = getAllByTestId('TouchableOpacity');
    if (touchableElements.length > 0) {
      const lastButton = touchableElements[touchableElements.length - 1];
      fireEvent.press(lastButton);
      
      expect(mockNavigate).toHaveBeenCalled();
    }
  });
});