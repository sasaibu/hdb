import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';

// Mock React Native components completely
jest.mock('react-native', () => {
  const React = require('react');
  
  const mockComponent = (name: string) => React.forwardRef((props: any, ref: any) => {
    return React.createElement('View', {
      ...props,
      ref,
      testID: props.testID || name,
      'data-component': name
    });
  });

  // Special Text component that preserves children
  const MockText = React.forwardRef((props: any, ref: any) => {
    return React.createElement('Text', {
      ...props,
      ref,
      testID: props.testID || 'Text',
      'data-component': 'Text'
    }, props.children);
  });

  // Special TouchableOpacity that handles onPress
  const MockTouchableOpacity = React.forwardRef((props: any, ref: any) => {
    return React.createElement('TouchableOpacity', {
      ...props,
      ref,
      testID: props.testID || 'TouchableOpacity',
      'data-component': 'TouchableOpacity',
      onPress: props.onPress,
      disabled: props.disabled
    }, props.children);
  });

  // Special Switch component
  const MockSwitch = React.forwardRef((props: any, ref: any) => {
    return React.createElement('Switch', {
      ...props,
      ref,
      testID: props.testID || 'Switch',
      'data-component': 'Switch',
      onValueChange: props.onValueChange,
      value: props.value,
      disabled: props.disabled
    });
  });

  return {
    // Basic components
    View: mockComponent('View'),
    Text: MockText,
    TouchableOpacity: MockTouchableOpacity,
    Switch: MockSwitch,
    SafeAreaView: mockComponent('SafeAreaView'),
    
    // Alert
    Alert: {
      alert: jest.fn(),
    },
    
    // StyleSheet
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
    },
  };
});

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../../src/services/NotificationService');

jest.mock('../../src/services/NativeNotificationModule', () => ({
  requestPermission: jest.fn(),
  scheduleNotification: jest.fn(),
  cancelNotification: jest.fn(),
  cancelAllNotifications: jest.fn(),
  getDeliveredNotifications: jest.fn(),
}));

import NotificationSettingsScreen from '../../src/screens/NotificationSettingsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import NotificationService from '../../src/services/NotificationService';

describe('NotificationSettingsScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  const mockNotificationService = {
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
    requestPermission: jest.fn(),
    sendImmediateNotification: jest.fn(),
    getInstance: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (NotificationService.getInstance as jest.Mock).mockReturnValue(mockNotificationService);
    
    // Default settings
    mockNotificationService.getSettings.mockResolvedValue({
      enabled: false,
      vitalDataReminder: true,
      medicationReminder: true,
      appointmentReminder: true,
      reminderTime: '09:00',
    });
  });

  it('renders correctly with main components', async () => {
    const {getByText} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      expect(getByText('通知設定')).toBeTruthy();
      expect(getByText('プッシュ通知をオンにすると下記のお知らせを受け取ることができます。')).toBeTruthy();
      expect(getByText('プッシュ通知を有効にする')).toBeTruthy();
      expect(getByText('バイタルデータ入力リマインダー')).toBeTruthy();
      expect(getByText('服薬リマインダー')).toBeTruthy();
      expect(getByText('予約リマインダー')).toBeTruthy();
      expect(getByText('テスト通知を送信')).toBeTruthy();
      expect(getByText('通知履歴を見る')).toBeTruthy();
    });
  });

  it('loads settings from NotificationService on mount', async () => {
    render(<NotificationSettingsScreen />);

    await waitFor(() => {
      expect(mockNotificationService.getSettings).toHaveBeenCalled();
    });
  });

  it('displays reminder time correctly', async () => {
    mockNotificationService.getSettings.mockResolvedValue({
      enabled: true,
      vitalDataReminder: true,
      medicationReminder: true,
      appointmentReminder: true,
      reminderTime: '10:30',
    });

    const {getByText} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      expect(getByText('リマインダー時刻: 10:30')).toBeTruthy();
    });
  });

  it('toggles notification settings correctly', async () => {
    const {getAllByTestId} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      const switches = getAllByTestId('Switch');
      expect(switches.length).toBeGreaterThan(0);
      
      // Toggle vital data reminder
      fireEvent(switches[1], 'valueChange', false);
      
      expect(mockNotificationService.updateSettings).toHaveBeenCalledWith({
        enabled: false,
        vitalDataReminder: false,
        medicationReminder: true,
        appointmentReminder: true,
        reminderTime: '09:00',
      });
    });
  });

  it('requests permission when enabling notifications', async () => {
    mockNotificationService.requestPermission.mockResolvedValue(true);

    const {getAllByTestId} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      const switches = getAllByTestId('Switch');
      const enableSwitch = switches[0]; // First switch is enable notifications
      
      fireEvent(enableSwitch, 'valueChange', true);
      
      expect(mockNotificationService.requestPermission).toHaveBeenCalled();
    });
  });

  it('updates settings when permission is granted', async () => {
    mockNotificationService.requestPermission.mockResolvedValue(true);

    const {getAllByTestId} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      const switches = getAllByTestId('Switch');
      const enableSwitch = switches[0];
      
      fireEvent(enableSwitch, 'valueChange', true);
    });

    await waitFor(() => {
      expect(mockNotificationService.updateSettings).toHaveBeenCalledWith({
        enabled: true,
        vitalDataReminder: true,
        medicationReminder: true,
        appointmentReminder: true,
        reminderTime: '09:00',
      });
    });
  });

  it('sends test notification when button is pressed', async () => {
    const {getByText} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      const testButton = getByText('テスト通知を送信');
      fireEvent.press(testButton);
      
      expect(mockNotificationService.sendImmediateNotification).toHaveBeenCalledWith({
        id: expect.stringMatching(/^test_\d+$/),
        title: 'テスト通知',
        body: 'プッシュ通知のテストです',
        type: 'general',
      });
    });
  });

  it('navigates to notification history when button is pressed', async () => {
    const {getByText} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      const historyButton = getByText('通知履歴を見る');
      fireEvent.press(historyButton);
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('NotificationHistory');
    });
  });

  it('handles settings loading error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockNotificationService.getSettings.mockRejectedValue(new Error('Load error'));

    render(<NotificationSettingsScreen />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('設定の読み込みに失敗しました:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles settings saving error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockNotificationService.updateSettings.mockRejectedValue(new Error('Save error'));

    const {getAllByTestId} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      const switches = getAllByTestId('Switch');
      fireEvent(switches[1], 'valueChange', false);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('設定の保存に失敗しました:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('disables reminder switches when notifications are disabled', async () => {
    mockNotificationService.getSettings.mockResolvedValue({
      enabled: false,
      vitalDataReminder: true,
      medicationReminder: true,
      appointmentReminder: true,
      reminderTime: '09:00',
    });

    const {getAllByTestId} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      const switches = getAllByTestId('Switch');
      // Switches 1, 2, 3 should be disabled when notifications are off
      expect(switches[1].props.disabled).toBe(true);
      expect(switches[2].props.disabled).toBe(true);
      expect(switches[3].props.disabled).toBe(true);
    });
  });

  it('enables reminder switches when notifications are enabled', async () => {
    mockNotificationService.getSettings.mockResolvedValue({
      enabled: true,
      vitalDataReminder: true,
      medicationReminder: true,
      appointmentReminder: true,
      reminderTime: '09:00',
    });

    const {getAllByTestId} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      const switches = getAllByTestId('Switch');
      // Switches 1, 2, 3 should be enabled when notifications are on
      expect(switches[1].props.disabled).toBe(false);
      expect(switches[2].props.disabled).toBe(false);
      expect(switches[3].props.disabled).toBe(false);
    });
  });

  it('displays correct switch values based on settings', async () => {
    mockNotificationService.getSettings.mockResolvedValue({
      enabled: true,
      vitalDataReminder: false,
      medicationReminder: true,
      appointmentReminder: false,
      reminderTime: '09:00',
    });

    const {getAllByTestId} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      const switches = getAllByTestId('Switch');
      expect(switches[0].props.value).toBe(true);  // enabled
      expect(switches[1].props.value).toBe(false); // vitalDataReminder
      expect(switches[2].props.value).toBe(true);  // medicationReminder
      expect(switches[3].props.value).toBe(false); // appointmentReminder
    });
  });

  it('toggles medication reminder correctly', async () => {
    const {getAllByTestId} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      const switches = getAllByTestId('Switch');
      fireEvent(switches[2], 'valueChange', false); // Toggle medication reminder
      
      expect(mockNotificationService.updateSettings).toHaveBeenCalledWith({
        enabled: false,
        vitalDataReminder: true,
        medicationReminder: false,
        appointmentReminder: true,
        reminderTime: '09:00',
      });
    });
  });

  it('toggles appointment reminder correctly', async () => {
    const {getAllByTestId} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      const switches = getAllByTestId('Switch');
      fireEvent(switches[3], 'valueChange', false); // Toggle appointment reminder
      
      expect(mockNotificationService.updateSettings).toHaveBeenCalledWith({
        enabled: false,
        vitalDataReminder: true,
        medicationReminder: true,
        appointmentReminder: false,
        reminderTime: '09:00',
      });
    });
  });

  it('renders all UI elements correctly', async () => {
    const {getByText} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      // Header
      expect(getByText('通知設定')).toBeTruthy();
      
      // Description
      expect(getByText('プッシュ通知をオンにすると下記のお知らせを受け取ることができます。')).toBeTruthy();
      
      // Settings labels
      expect(getByText('プッシュ通知を有効にする')).toBeTruthy();
      expect(getByText('バイタルデータ入力リマインダー')).toBeTruthy();
      expect(getByText('服薬リマインダー')).toBeTruthy();
      expect(getByText('予約リマインダー')).toBeTruthy();
      expect(getByText('リマインダー時刻: 09:00')).toBeTruthy();
      
      // Buttons
      expect(getByText('テスト通知を送信')).toBeTruthy();
      expect(getByText('通知履歴を見る')).toBeTruthy();
    });
  });
});
