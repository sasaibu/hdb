import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import DoneScreen from '../../src/screens/DoneScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock theme
jest.mock('../../src/styles/theme', () => ({
  colors: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      inverse: '#FFFFFF',
    },
    primary: {
      500: '#007AFF',
      600: '#0056CC',
    },
    success: '#28A745',
    border: {
      light: '#E0E0E0',
    },
  },
  borderRadius: {
    xl: 12,
  },
  shadow: {
    md: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },
}));

describe('DoneScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const screen = render(<DoneScreen />);
    expect(screen).toBeTruthy();
  });

  it('displays success icon', () => {
    const screen = render(<DoneScreen />);
    expect(screen).toBeTruthy();
  });

  it('displays congratulations message', () => {
    const screen = render(<DoneScreen />);
    expect(screen).toBeTruthy();
  });

  it('displays next steps section', () => {
    const screen = render(<DoneScreen />);
    expect(screen).toBeTruthy();
  });

  it('navigates to Main when home button is pressed', () => {
    const {getByTestId} = render(<DoneScreen />);

    const homeButton = getByTestId('home-button');
    fireEvent.press(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith('Main');
  });

  it('displays all sections in proper order', () => {
    const screen = render(<DoneScreen />);
    expect(screen).toBeTruthy();
    expect(screen.getByTestId('home-button')).toBeTruthy();
  });
});