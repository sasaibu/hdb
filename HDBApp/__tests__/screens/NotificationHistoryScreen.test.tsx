import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import NotificationHistoryScreen from '../../src/screens/NotificationHistoryScreen';
import {Alert} from 'react-native';

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockGoBack = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
};

// Mock notification data
const mockNotifications = [
  {
    id: '1',
    title: 'システムメンテナンス',
    message: '本日23:00より定期メンテナンスを実施します',
    type: 'info' as const,
    timestamp: '2025-07-11T10:00:00Z',
    read: false,
  },
  {
    id: '2',
    title: '目標達成',
    message: '今日の歩数目標を達成しました！',
    type: 'success' as const,
    timestamp: '2025-07-10T15:00:00Z',
    read: true,
  },
  {
    id: '3',
    title: 'データ同期エラー',
    message: 'データの同期に失敗しました。再試行してください。',
    type: 'error' as const,
    timestamp: '2025-07-09T12:00:00Z',
    read: true,
  },
];

describe('NotificationHistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with header', () => {
    const {getByText} = render(
      <NotificationHistoryScreen navigation={mockNavigation as any} />
    );

    expect(getByText('通知履歴')).toBeTruthy();
    expect(getByText('戻る')).toBeTruthy();
    expect(getByText('すべて削除')).toBeTruthy();
  });

  it('displays loading state initially', () => {
    const {getByTestId} = render(
      <NotificationHistoryScreen navigation={mockNavigation as any} />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('displays notifications after loading', async () => {
    const {getByText, queryByTestId} = render(
      <NotificationHistoryScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeFalsy();
      expect(getByText('システムメンテナンス')).toBeTruthy();
      expect(getByText('目標達成')).toBeTruthy();
      expect(getByText('データ同期エラー')).toBeTruthy();
    });
  });

  it('displays unread indicator for unread notifications', async () => {
    const {getByTestId} = render(
      <NotificationHistoryScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByTestId('unread-indicator-1')).toBeTruthy();
    });
  });

  it('marks notification as read when tapped', async () => {
    const {getByText, queryByTestId} = render(
      <NotificationHistoryScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('システムメンテナンス')).toBeTruthy();
    });

    const notification = getByText('システムメンテナンス').parent?.parent;
    fireEvent.press(notification!);

    await waitFor(() => {
      expect(queryByTestId('unread-indicator-1')).toBeFalsy();
    });
  });

  it('navigates back when back button is pressed', () => {
    const {getByText} = render(
      <NotificationHistoryScreen navigation={mockNavigation as any} />
    );

    const backButton = getByText('戻る');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('shows delete confirmation when delete all is pressed', async () => {
    const {getByText} = render(
      <NotificationHistoryScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('システムメンテナンス')).toBeTruthy();
    });

    const deleteAllButton = getByText('すべて削除');
    fireEvent.press(deleteAllButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      '確認',
      'すべての通知履歴を削除しますか？',
      expect.any(Array)
    );
  });

  it('deletes all notifications when confirmed', async () => {
    const {getByText, queryByText} = render(
      <NotificationHistoryScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('システムメンテナンス')).toBeTruthy();
    });

    const deleteAllButton = getByText('すべて削除');
    fireEvent.press(deleteAllButton);

    // Get the confirm button from Alert
    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = alertButtons.find((btn: any) => btn.text === '削除');
    confirmButton.onPress();

    await waitFor(() => {
      expect(queryByText('システムメンテナンス')).toBeFalsy();
      expect(queryByText('目標達成')).toBeFalsy();
      expect(queryByText('データ同期エラー')).toBeFalsy();
    });
  });

  it('displays empty state when no notifications', async () => {
    const {getByText, queryByText} = render(
      <NotificationHistoryScreen navigation={mockNavigation as any} />
    );

    // Delete all notifications
    await waitFor(() => {
      expect(getByText('システムメンテナンス')).toBeTruthy();
    });

    const deleteAllButton = getByText('すべて削除');
    fireEvent.press(deleteAllButton);

    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = alertButtons.find((btn: any) => btn.text === '削除');
    confirmButton.onPress();

    await waitFor(() => {
      expect(getByText('通知履歴はありません')).toBeTruthy();
    });
  });

  it('displays notification icons based on type', async () => {
    const {getByTestId} = render(
      <NotificationHistoryScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByTestId('notification-icon-info')).toBeTruthy();
      expect(getByTestId('notification-icon-success')).toBeTruthy();
      expect(getByTestId('notification-icon-error')).toBeTruthy();
    });
  });

  it('formats timestamps correctly', async () => {
    const {getByText} = render(
      <NotificationHistoryScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      // Timestamps should be formatted in Japanese locale
      expect(getByText(/2025年7月11日/)).toBeTruthy();
      expect(getByText(/2025年7月10日/)).toBeTruthy();
      expect(getByText(/2025年7月9日/)).toBeTruthy();
    });
  });

  it('sorts notifications by timestamp (newest first)', async () => {
    const {getAllByTestId} = render(
      <NotificationHistoryScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      const notificationItems = getAllByTestId(/notification-item-/);
      expect(notificationItems[0]).toHaveProperty('_fiber.key', 'notification-item-1');
      expect(notificationItems[1]).toHaveProperty('_fiber.key', 'notification-item-2');
      expect(notificationItems[2]).toHaveProperty('_fiber.key', 'notification-item-3');
    });
  });
});