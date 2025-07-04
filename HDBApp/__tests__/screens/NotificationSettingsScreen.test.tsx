import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationSettingsScreen from '../../src/screens/NotificationSettingsScreen';

// AsyncStorageをモック化
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('NotificationSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態で正しく表示される', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const {getByText} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      expect(getByText('通知設定')).toBeTruthy();
      expect(getByText('プッシュ通知をすべて受け取る')).toBeTruthy();
      expect(getByText('新規お知らせ')).toBeTruthy();
      expect(getByText('未閲覧の受信')).toBeTruthy();
      expect(getByText('ストレスチェック')).toBeTruthy();
    });
  });

  it('保存された設定を正しく読み込む', async () => {
    const savedSettings = {
      all: true,
      news: true,
      unread: true,
      stressCheck: true,
    };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedSettings));

    const {getByTestId} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('notificationSettings');
    });
  });

  it('設定変更時に保存される', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();

    const {getAllByRole} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      const switches = getAllByRole('switch');
      fireEvent(switches[1], 'onValueChange', false); // 新規お知らせをオフに
    });

    await waitFor(() => {
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'notificationSettings',
        expect.stringContaining('"news":false')
      );
    });
  });

  it('すべて受け取るスイッチが他の設定を制御する', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();

    const {getAllByRole} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      const switches = getAllByRole('switch');
      fireEvent(switches[0], 'onValueChange', true); // すべて受け取るをオンに
    });

    await waitFor(() => {
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'notificationSettings',
        JSON.stringify({
          all: true,
          news: true,
          unread: true,
          stressCheck: true,
        })
      );
    });
  });

  it('設定読み込みエラーを適切に処理する', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockAsyncStorage.getItem.mockRejectedValue(new Error('読み込みエラー'));

    render(<NotificationSettingsScreen />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('設定の読み込みに失敗しました:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('設定保存エラーを適切に処理する', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockRejectedValue(new Error('保存エラー'));

    const {getAllByRole} = render(<NotificationSettingsScreen />);

    await waitFor(() => {
      const switches = getAllByRole('switch');
      fireEvent(switches[1], 'onValueChange', false);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('設定の保存に失敗しました:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
