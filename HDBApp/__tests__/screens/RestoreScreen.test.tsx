import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import RestoreScreen from '../../src/screens/RestoreScreen';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  multiSet: jest.fn(),
}));

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  readFile: jest.fn(),
  exists: jest.fn(),
  unlink: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

const mockGoBack = jest.fn();
const mockReplace = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
  replace: mockReplace,
};

describe('RestoreScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const {getByText} = render(
      <RestoreScreen navigation={mockNavigation as any} />
    );

    expect(getByText('データ復元')).toBeTruthy();
    expect(getByText('戻る')).toBeTruthy();
    expect(getByText('バックアップから復元')).toBeTruthy();
  });

  it('displays restore information', () => {
    const {getByText} = render(
      <RestoreScreen navigation={mockNavigation as any} />
    );

    expect(getByText('復元に関する注意事項')).toBeTruthy();
    expect(getByText(/現在のデータは上書きされます/)).toBeTruthy();
    expect(getByText(/復元前にバックアップを作成することを推奨/)).toBeTruthy();
  });

  it('loads available backups on mount', async () => {
    const mockBackups = [
      {
        id: 'backup-1',
        date: '2025-07-10T10:00:00Z',
        size: 1024,
        version: '1.0.0',
      },
      {
        id: 'backup-2',
        date: '2025-07-09T10:00:00Z',
        size: 2048,
        version: '1.0.0',
      },
    ];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockBackups)
    );

    const {getByText} = render(
      <RestoreScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('利用可能なバックアップ')).toBeTruthy();
      expect(getByText(/2025年7月10日/)).toBeTruthy();
      expect(getByText(/2025年7月9日/)).toBeTruthy();
    });
  });

  it('shows empty state when no backups available', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const {getByText} = render(
      <RestoreScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('復元可能なバックアップがありません')).toBeTruthy();
    });
  });

  it('shows restore confirmation when backup is selected', async () => {
    const mockBackups = [
      {
        id: 'backup-1',
        date: '2025-07-10T10:00:00Z',
        size: 1024,
        version: '1.0.0',
      },
    ];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockBackups)
    );

    const {getByTestId} = render(
      <RestoreScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      const restoreButton = getByTestId('restore-backup-1');
      fireEvent.press(restoreButton);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      '復元の確認',
      expect.stringContaining('このバックアップから復元しますか？'),
      expect.any(Array)
    );
  });

  it('performs restore when confirmed', async () => {
    const mockBackups = [
      {
        id: 'backup-1',
        date: '2025-07-10T10:00:00Z',
        size: 1024,
        version: '1.0.0',
        data: {
          vitals: [{id: 1, type: 'steps', value: 8000}],
          settings: {notifications: true},
        },
      },
    ];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockBackups)
    );

    (RNFS.exists as jest.Mock).mockResolvedValue(true);
    (RNFS.readFile as jest.Mock).mockResolvedValue(
      JSON.stringify(mockBackups[0].data)
    );

    const {getByTestId} = render(
      <RestoreScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      const restoreButton = getByTestId('restore-backup-1');
      fireEvent.press(restoreButton);
    });

    // Confirm restore
    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = alertButtons.find((btn: any) => btn.text === '復元する');
    confirmButton.onPress();

    await waitFor(() => {
      expect(AsyncStorage.clear).toHaveBeenCalled();
      expect(AsyncStorage.multiSet).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        '成功',
        'データの復元が完了しました',
        expect.any(Array)
      );
    });
  });

  it('handles restore error gracefully', async () => {
    const mockBackups = [
      {
        id: 'backup-1',
        date: '2025-07-10T10:00:00Z',
        size: 1024,
        version: '1.0.0',
      },
    ];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockBackups)
    );
    (AsyncStorage.clear as jest.Mock).mockRejectedValue(new Error('Clear failed'));

    const {getByTestId} = render(
      <RestoreScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      const restoreButton = getByTestId('restore-backup-1');
      fireEvent.press(restoreButton);
    });

    // Confirm restore
    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = alertButtons.find((btn: any) => btn.text === '復元する');
    confirmButton.onPress();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        'データの復元に失敗しました',
        expect.any(Array)
      );
    });
  });

  it('navigates back when back button is pressed', () => {
    const {getByText} = render(
      <RestoreScreen navigation={mockNavigation as any} />
    );

    const backButton = getByText('戻る');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('shows progress during restore', async () => {
    const mockBackups = [
      {
        id: 'backup-1',
        date: '2025-07-10T10:00:00Z',
        size: 1024,
        version: '1.0.0',
      },
    ];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockBackups)
    );

    const {getByTestId, queryByTestId} = render(
      <RestoreScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      const restoreButton = getByTestId('restore-backup-1');
      fireEvent.press(restoreButton);
    });

    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = alertButtons.find((btn: any) => btn.text === '復元する');
    confirmButton.onPress();

    // Check for loading indicator
    expect(queryByTestId('restore-progress')).toBeTruthy();
  });

  it('navigates to home after successful restore', async () => {
    const mockBackups = [
      {
        id: 'backup-1',
        date: '2025-07-10T10:00:00Z',
        size: 1024,
        version: '1.0.0',
        data: {},
      },
    ];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockBackups)
    );

    const {getByTestId} = render(
      <RestoreScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      const restoreButton = getByTestId('restore-backup-1');
      fireEvent.press(restoreButton);
    });

    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = alertButtons.find((btn: any) => btn.text === '復元する');
    confirmButton.onPress();

    await waitFor(() => {
      const successAlertButtons = (Alert.alert as jest.Mock).mock.calls[1][2];
      const okButton = successAlertButtons[0];
      okButton.onPress();
      
      expect(mockReplace).toHaveBeenCalledWith('Main');
    });
  });

  it('displays backup version compatibility warning', async () => {
    const mockBackups = [
      {
        id: 'backup-1',
        date: '2025-07-10T10:00:00Z',
        size: 1024,
        version: '0.9.0', // Older version
      },
    ];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockBackups)
    );

    const {getByText} = render(
      <RestoreScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText(/バージョン: 0.9.0/)).toBeTruthy();
      expect(getByText(/互換性に注意/)).toBeTruthy();
    });
  });
});