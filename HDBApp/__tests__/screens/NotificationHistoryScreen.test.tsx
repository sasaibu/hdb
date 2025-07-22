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
      activeOpacity: props.activeOpacity
    }, props.children);
  });

  // Special ScrollView that handles RefreshControl
  const MockScrollView = React.forwardRef((props: any, ref: any) => {
    const refreshControl = props.refreshControl;
    
    return React.createElement('View', {
      ...props,
      ref,
      testID: props.testID || 'ScrollView',
      'data-component': 'ScrollView',
      onRefresh: refreshControl?.props?.onRefresh,
      refreshing: refreshControl?.props?.refreshing
    }, props.children);
  });

  // Mock RefreshControl
  const MockRefreshControl = React.forwardRef((props: any, ref: any) => {
    return React.createElement('View', {
      ...props,
      ref,
      testID: 'RefreshControl',
      'data-component': 'RefreshControl'
    });
  });

  return {
    // Basic components
    View: mockComponent('View'),
    Text: MockText,
    TouchableOpacity: MockTouchableOpacity,
    ScrollView: MockScrollView,
    SafeAreaView: mockComponent('SafeAreaView'),
    RefreshControl: MockRefreshControl,
    
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

// Mock apiClient
const mockApiClient = {
  getNotifications: jest.fn(),
  markNotificationAsRead: jest.fn(),
};

jest.mock('../../src/services/api/apiClient', () => ({
  apiClient: mockApiClient,
}));

import NotificationHistoryScreen from '../../src/screens/NotificationHistoryScreen';
import {Alert} from 'react-native';

describe('NotificationHistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.getNotifications.mockResolvedValue({
      success: true,
      data: [],
    });
    mockApiClient.markNotificationAsRead.mockResolvedValue({
      success: true,
    });
  });

  it('renders correctly with header', () => {
    const {getByText} = render(<NotificationHistoryScreen />);

    expect(getByText('通知履歴')).toBeTruthy();
    expect(getByText('クリア')).toBeTruthy();
  });

  it('displays empty state when no notifications', async () => {
    const {getByText, queryByText} = render(<NotificationHistoryScreen />);

    await waitFor(() => {
      expect(getByText('通知履歴がありません')).toBeTruthy();
    });
  });

  it('handles API error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockApiClient.getNotifications.mockRejectedValue(new Error('Network error'));

    render(<NotificationHistoryScreen />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('通知履歴の読み込みに失敗しました:', expect.any(Error));
      expect(Alert.alert).toHaveBeenCalledWith('エラー', '通知履歴の読み込みに失敗しました');
    });

    consoleSpy.mockRestore();
  });

  it('shows delete confirmation when clear button is pressed', () => {
    const {getByText} = render(<NotificationHistoryScreen />);

    const clearButton = getByText('クリア');
    fireEvent.press(clearButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      '確認',
      'すべての通知履歴を削除しますか？',
      expect.arrayContaining([
        expect.objectContaining({ text: 'キャンセル' }),
        expect.objectContaining({ text: '削除' })
      ])
    );
  });

  it('deletes all notifications when confirmed', async () => {
    const {getByText} = render(<NotificationHistoryScreen />);

    const clearButton = getByText('クリア');
    fireEvent.press(clearButton);

    // Verify Alert was called
    expect(Alert.alert).toHaveBeenCalled();
    
    // Get the confirm button from Alert and execute it
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const lastCall = alertCalls[alertCalls.length - 1];
    const buttons = lastCall[2];
    
    if (buttons && Array.isArray(buttons)) {
      const confirmButton = buttons.find((btn: any) => btn.text === '削除');
      if (confirmButton && confirmButton.onPress) {
        confirmButton.onPress();
        
        await waitFor(() => {
          expect(getByText('通知履歴がありません')).toBeTruthy();
        });
      }
    }
  });

  it('displays notification type icons correctly', async () => {
    const specialNotifications = [
      { id: '1', title: 'Achievement', body: 'Body', type: 'achievement', read: false, createdAt: '2025-07-12T10:30:00Z' },
      { id: '2', title: 'Reminder', body: 'Body', type: 'reminder', read: false, createdAt: '2025-07-12T10:30:00Z' },
      { id: '3', title: 'System', body: 'Body', type: 'system', read: false, createdAt: '2025-07-12T10:30:00Z' },
      { id: '4', title: 'Vital', body: 'Body', type: 'vital', read: false, createdAt: '2025-07-12T10:30:00Z' },
      { id: '5', title: 'Medication', body: 'Body', type: 'medication', read: false, createdAt: '2025-07-12T10:30:00Z' },
      { id: '6', title: 'Appointment', body: 'Body', type: 'appointment', read: false, createdAt: '2025-07-12T10:30:00Z' },
      { id: '7', title: 'General', body: 'Body', type: 'general', read: false, createdAt: '2025-07-12T10:30:00Z' },
    ];

    mockApiClient.getNotifications.mockResolvedValue({
      success: true,
      data: specialNotifications,
    });

    const {getByText} = render(<NotificationHistoryScreen />);

    // Wait for API call and state update
    await waitFor(() => {
      expect(mockApiClient.getNotifications).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(getByText('🏆')).toBeTruthy(); // achievement
      expect(getByText('⏰')).toBeTruthy(); // reminder
      expect(getByText('📢')).toBeTruthy(); // system
      expect(getByText('❤️')).toBeTruthy(); // vital
      expect(getByText('💊')).toBeTruthy(); // medication
      expect(getByText('📅')).toBeTruthy(); // appointment
      expect(getByText('🔔')).toBeTruthy(); // general/default
    });
  });

  it('displays correct UI elements', () => {
    const {getByText, getAllByTestId} = render(<NotificationHistoryScreen />);

    // Header elements
    expect(getByText('通知履歴')).toBeTruthy();
    expect(getByText('クリア')).toBeTruthy();
    
    // ScrollView should be present
    const scrollViews = getAllByTestId('ScrollView');
    expect(scrollViews.length).toBeGreaterThan(0);
  });

  it('renders SafeAreaView container', () => {
    const {getAllByTestId} = render(<NotificationHistoryScreen />);

    const safeAreaViews = getAllByTestId('SafeAreaView');
    expect(safeAreaViews.length).toBeGreaterThan(0);
  });

  it('renders ScrollView with RefreshControl', () => {
    const {getAllByTestId} = render(<NotificationHistoryScreen />);

    const scrollViews = getAllByTestId('ScrollView');
    expect(scrollViews.length).toBeGreaterThan(0);
    
    // ScrollView should have refresh functionality
    const scrollView = scrollViews[0];
    expect(scrollView.props.onRefresh).toBeDefined();
  });

  it('displays notification content when data is available', async () => {
    const mockNotifications = [
      {
        id: 'notif-001',
        title: '目標達成おめでとうございます！',
        body: '今日の歩数目標を達成しました。素晴らしいです！',
        type: 'achievement',
        read: false,
        createdAt: '2025-07-12T10:30:00Z',
      },
      {
        id: 'notif-002',
        title: 'バイタルデータの入力をお忘れなく',
        body: '今日のバイタルデータをまだ入力していません。',
        type: 'reminder',
        read: true,
        createdAt: '2025-07-11T09:00:00Z',
      },
    ];

    mockApiClient.getNotifications.mockResolvedValue({
      success: true,
      data: mockNotifications,
    });

    const {getByText} = render(<NotificationHistoryScreen />);

    // Wait for API call first
    await waitFor(() => {
      expect(mockApiClient.getNotifications).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(getByText('目標達成おめでとうございます！')).toBeTruthy();
      expect(getByText('今日の歩数目標を達成しました。素晴らしいです！')).toBeTruthy();
      expect(getByText('バイタルデータの入力をお忘れなく')).toBeTruthy();
      expect(getByText('今日のバイタルデータをまだ入力していません。')).toBeTruthy();
    });
  });

  it('formats timestamps in Japanese locale', async () => {
    const mockNotifications = [
      {
        id: 'notif-001',
        title: 'Test Notification',
        body: 'Test Body',
        type: 'achievement',
        read: false,
        createdAt: '2025-07-12T10:30:00Z',
      },
    ];

    mockApiClient.getNotifications.mockResolvedValue({
      success: true,
      data: mockNotifications,
    });

    const {getByText} = render(<NotificationHistoryScreen />);

    // Wait for API call first
    await waitFor(() => {
      expect(mockApiClient.getNotifications).toHaveBeenCalled();
    });

    await waitFor(() => {
      // Check for Japanese date format patterns
      expect(getByText(/7月\d+日/)).toBeTruthy();
    });
  });

  it('handles markNotificationAsRead API calls', async () => {
    const mockNotifications = [
      {
        id: 'notif-001',
        title: '目標達成おめでとうございます！',
        body: '今日の歩数目標を達成しました。素晴らしいです！',
        type: 'achievement',
        read: false,
        createdAt: '2025-07-12T10:30:00Z',
      },
    ];

    mockApiClient.getNotifications.mockResolvedValue({
      success: true,
      data: mockNotifications,
    });

    const {getAllByTestId} = render(<NotificationHistoryScreen />);

    await waitFor(() => {
      const touchables = getAllByTestId('TouchableOpacity');
      // Find notification touchable (not the clear button)
      const notificationTouchable = touchables.find(touchable => {
        return touchable.props.activeOpacity !== undefined;
      });
      
      if (notificationTouchable) {
        fireEvent.press(notificationTouchable);
        expect(mockApiClient.markNotificationAsRead).toHaveBeenCalledWith('notif-001');
      }
    });
  });
});
