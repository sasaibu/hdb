import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoalSettingScreen from '../../src/screens/GoalSettingScreen';
import {GoalProvider} from '../../src/contexts/GoalContext';
import {GOAL_SETTING_CONTENT} from '../../src/constants/goalSettingContent';

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

  it('renders correctly', () => {
    const {getByText} = render(
      <GoalProvider>
        <GoalSettingScreen navigation={navigation} route={route} />
      </GoalProvider>
    );

    // Check for partial text content since the full text might be split across lines
    expect(getByText(/ダウンロードいただき、ありがとうございます！/)).toBeTruthy();
    expect(getByText(GOAL_SETTING_CONTENT.buttonText)).toBeTruthy();
    expect(getByText(/bondaviの継続する記述とは？/)).toBeTruthy();
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

  it('handles confirm button press', async () => {
    const {getByText} = render(
      <GoalProvider>
        <GoalSettingScreen navigation={navigation} route={route} />
      </GoalProvider>
    );

    const confirmButton = getByText(GOAL_SETTING_CONTENT.buttonText);
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('goalSettingShown', 'true');
      expect(mockNavigate).toHaveBeenCalledWith('GoalInput');
    });
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

  it('handles AsyncStorage error on save', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const {getByText} = render(
      <GoalProvider>
        <GoalSettingScreen navigation={navigation} route={route} />
      </GoalProvider>
    );

    const confirmButton = getByText(GOAL_SETTING_CONTENT.buttonText);
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to save goal setting status:',
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });

  it('logs when confirm button is pressed', async () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation();

    const {getByText} = render(
      <GoalProvider>
        <GoalSettingScreen navigation={navigation} route={route} />
      </GoalProvider>
    );

    const confirmButton = getByText(GOAL_SETTING_CONTENT.buttonText);
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(consoleLog).toHaveBeenCalledWith('確認ボタンが押されました');
    });

    consoleLog.mockRestore();
  });
});