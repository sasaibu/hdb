import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import BackupScreen from '../../src/screens/BackupScreen';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

const mockGoBack = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
};

describe('BackupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const {getByText} = render(
      <BackupScreen navigation={mockNavigation as any} />
    );

    expect(getByText('データバックアップ')).toBeTruthy();
    expect(getByText('戻る')).toBeTruthy();
    expect(getByText('バックアップを作成')).toBeTruthy();
    expect(getByText('バックアップ履歴')).toBeTruthy();
  });

  it('displays backup information', () => {
    const {getByText} = render(
      <BackupScreen navigation={mockNavigation as any} />
    );

    expect(getByText('バックアップ対象')).toBeTruthy();
    expect(getByText(/バイタルデータ/)).toBeTruthy();
    expect(getByText(/ユーザー設定/)).toBeTruthy();
    expect(getByText(/通知設定/)).toBeTruthy();
  });

  it('loads existing backups on mount', async () => {
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
      <BackupScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText(/2025年7月10日/)).toBeTruthy();
      expect(getByText(/2025年7月9日/)).toBeTruthy();
    });
  });

  it('creates backup when button is pressed', async () => {
    const {getByText} = render(
      <BackupScreen navigation={mockNavigation as any} />
    );

    const createButton = getByText('バックアップを作成');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '成功',
        'バックアップが作成されました',
        expect.any(Array)
      );
    });
  });

  it('shows progress during backup creation', async () => {
    const {getByText, queryByTestId} = render(
      <BackupScreen navigation={mockNavigation as any} />
    );

    const createButton = getByText('バックアップを作成');
    fireEvent.press(createButton);

    // Check for loading indicator
    expect(queryByTestId('backup-progress')).toBeTruthy();

    await waitFor(() => {
      expect(queryByTestId('backup-progress')).toBeFalsy();
    });
  });

  it('handles backup creation error', async () => {
    // Mock AsyncStorage to throw error
    (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValue(
      new Error('Storage error')
    );

    const {getByText} = render(
      <BackupScreen navigation={mockNavigation as any} />
    );

    const createButton = getByText('バックアップを作成');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        'バックアップの作成に失敗しました',
        expect.any(Array)
      );
    });
  });

  it('navigates back when back button is pressed', () => {
    const {getByText} = render(
      <BackupScreen navigation={mockNavigation as any} />
    );

    const backButton = getByText('戻る');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('shows delete confirmation for backup item', async () => {
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
      <BackupScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      const deleteButton = getByTestId('delete-backup-1');
      fireEvent.press(deleteButton);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      '確認',
      'このバックアップを削除しますか？',
      expect.any(Array)
    );
  });

  it('deletes backup when confirmed', async () => {
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

    const {getByTestId, queryByText} = render(
      <BackupScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      const deleteButton = getByTestId('delete-backup-1');
      fireEvent.press(deleteButton);
    });

    // Confirm deletion
    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = alertButtons.find((btn: any) => btn.text === '削除');
    confirmButton.onPress();

    await waitFor(() => {
      expect(queryByText(/2025年7月10日/)).toBeFalsy();
    });
  });

  it('displays backup size in appropriate units', async () => {
    const mockBackups = [
      {
        id: 'backup-1',
        date: '2025-07-10T10:00:00Z',
        size: 1024, // 1KB
        version: '1.0.0',
      },
      {
        id: 'backup-2',
        date: '2025-07-09T10:00:00Z',
        size: 1048576, // 1MB
        version: '1.0.0',
      },
    ];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockBackups)
    );

    const {getByText} = render(
      <BackupScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText(/1.0 KB/)).toBeTruthy();
      expect(getByText(/1.0 MB/)).toBeTruthy();
    });
  });

  it('shows empty state when no backups exist', () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const {getByText} = render(
      <BackupScreen navigation={mockNavigation as any} />
    );

    expect(getByText('バックアップがありません')).toBeTruthy();
  });

  it('limits backup history to 10 items', async () => {
    const mockBackups = Array.from({length: 15}, (_, i) => ({
      id: `backup-${i}`,
      date: new Date(2025, 6, 10 - i).toISOString(),
      size: 1024,
      version: '1.0.0',
    }));

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockBackups)
    );

    const {getAllByTestId} = render(
      <BackupScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      const backupItems = getAllByTestId(/backup-item-/);
      expect(backupItems).toHaveLength(10);
    });
  });
});