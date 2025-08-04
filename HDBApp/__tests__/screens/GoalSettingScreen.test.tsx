import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoalSettingScreen from '../../src/screens/GoalSettingScreen';
import {GoalProvider} from '../../src/contexts/GoalContext';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const navigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
} as any;

const route = {
  params: {},
} as any;

// Mock the ScreenWithBottomNav component
jest.mock('../../src/components/ScreenWithBottomNav', () => {
  const {View} = require('react-native');
  return ({children}: any) => <View>{children}</View>;
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock GoalContext
const mockSetIsGoalSetting = jest.fn();
jest.mock('../../src/contexts/GoalContext', () => ({
  useGoal: () => ({
    setIsGoalSetting: mockSetIsGoalSetting,
  }),
  GoalProvider: ({children}: any) => <>{children}</>,
}));

describe('GoalSettingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('renders without crashing', () => {
    const screen = render(
      <GoalProvider>
        <GoalSettingScreen navigation={navigation} route={route} />
      </GoalProvider>
    );

    expect(screen).toBeTruthy();
  });

  it('sets goal setting mode on mount', () => {
    render(
      <GoalProvider>
        <GoalSettingScreen navigation={navigation} route={route} />
      </GoalProvider>
    );

    expect(mockSetIsGoalSetting).toHaveBeenCalledWith(true);
  });

  it('unsets goal setting mode on unmount', () => {
    const {unmount} = render(
      <GoalProvider>
        <GoalSettingScreen navigation={navigation} route={route} />
      </GoalProvider>
    );

    unmount();

    expect(mockSetIsGoalSetting).toHaveBeenCalledWith(false);
  });

  it('navigates back if already shown', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');

    render(
      <GoalProvider>
        <GoalSettingScreen navigation={navigation} route={route} />
      </GoalProvider>
    );

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('does not navigate back if not shown', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    render(
      <GoalProvider>
        <GoalSettingScreen navigation={navigation} route={route} />
      </GoalProvider>
    );

    await waitFor(() => {
      expect(mockGoBack).not.toHaveBeenCalled();
    });
  });

  it('contains interactive elements', () => {
    const {getAllByTestId} = render(
      <GoalProvider>
        <GoalSettingScreen navigation={navigation} route={route} />
      </GoalProvider>
    );

    // Should contain TouchableOpacity elements
    const touchableElements = getAllByTestId('TouchableOpacity');
    expect(touchableElements.length).toBeGreaterThan(0);
  });

  it('handles AsyncStorage error on check', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    render(
      <GoalProvider>
        <GoalSettingScreen navigation={navigation} route={route} />
      </GoalProvider>
    );

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to check goal setting status:',
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });

  it('handles button press functionality', async () => {
    const {getAllByTestId} = render(
      <GoalProvider>
        <GoalSettingScreen navigation={navigation} route={route} />
      </GoalProvider>
    );

    const touchableElements = getAllByTestId('TouchableOpacity');
    if (touchableElements.length > 0) {
      fireEvent.press(touchableElements[0]);
      
      await waitFor(() => {
        // Either navigation or AsyncStorage should be called
        expect(mockNavigate).toHaveBeenCalled();
      });
    }
  });
});