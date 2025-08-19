import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DataMigrationScreen from '../../src/screens/DataMigrationScreen';
import { mockApi } from '../../src/services/api/mockApi';

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('../../src/services/api/mockApi', () => ({
  mockApi: {
    getMigrationData: jest.fn(),
  },
}));

describe('DataMigrationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ id: 'test-user', email: 'test@example.com' })
    );
  });

  it('renders correctly', () => {
    const { getByText } = render(<DataMigrationScreen />);
    
    expect(getByText('dヘルスケア データ移行')).toBeTruthy();
    expect(getByText(/dヘルスケアのデータを移行できます/)).toBeTruthy();
    expect(getByText('データの移行')).toBeTruthy();
  });

  it('displays migration information', () => {
    const { getByText } = render(<DataMigrationScreen />);
    
    expect(getByText('移行データについて:')).toBeTruthy();
    expect(getByText('• CSV形式でバイタルデータを取得')).toBeTruthy();
    expect(getByText('• 最新IF仕様書No.5準拠')).toBeTruthy();
  });

  it('shows progress during migration', async () => {
    (mockApi.getMigrationData as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        migrationData: [{ id: 1, type: 'steps', value: 1000 }],
        hasMoreData: false,
        nextIndex: 1,
        completedPercentage: 100,
      },
    });

    const { getByText, queryByText } = render(<DataMigrationScreen />);
    
    const startButton = getByText('データの移行');
    fireEvent.press(startButton);

    await waitFor(() => {
      expect(queryByText(/移行データを取得中/)).toBeTruthy();
    });
  });

  it('handles migration success', async () => {
    (mockApi.getMigrationData as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        migrationData: [{ id: 1, type: 'steps', value: 1000 }],
        hasMoreData: false,
        nextIndex: 1,
        completedPercentage: 100,
      },
    });

    const { getByText } = render(<DataMigrationScreen />);
    
    const startButton = getByText('データの移行');
    fireEvent.press(startButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '移行完了',
        expect.stringContaining('dヘルスケアのデータ移行が完了しました'),
        expect.any(Array)
      );
    }, { timeout: 5000 });
  });

  it('handles migration error gracefully', async () => {
    (mockApi.getMigrationData as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { getByText } = render(<DataMigrationScreen />);
    
    const startButton = getByText('データの移行');
    fireEvent.press(startButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        expect.stringContaining('データ移行に失敗しました')
      );
    });
  });

  it('shows error when user is not logged in', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(<DataMigrationScreen />);
    
    const startButton = getByText('データの移行');
    fireEvent.press(startButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        'ユーザー情報が見つかりません'
      );
    });
  });

  it('can cancel migration', async () => {
    (mockApi.getMigrationData as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        success: true,
        data: {
          migrationData: [{ id: 1, type: 'steps', value: 1000 }],
          hasMoreData: false,
          nextIndex: 1,
          completedPercentage: 100,
        },
      }), 1000))
    );

    const { getByText, queryByText } = render(<DataMigrationScreen />);
    
    const startButton = getByText('データの移行');
    fireEvent.press(startButton);

    await waitFor(() => {
      expect(queryByText(/移行データを取得中/)).toBeTruthy();
    });

    const cancelButton = getByText('データの移行の中断');
    fireEvent.press(cancelButton);

    expect(queryByText(/移行データを取得中/)).toBeFalsy();
  });

  it('handles pagination correctly', async () => {
    // First page
    (mockApi.getMigrationData as jest.Mock)
      .mockResolvedValueOnce({
        success: true,
        data: {
          migrationData: Array(100).fill({ id: 1, type: 'steps', value: 1000 }),
          hasMoreData: true,
          nextIndex: 100,
          completedPercentage: 50,
        },
      })
      // Second page
      .mockResolvedValueOnce({
        success: true,
        data: {
          migrationData: Array(50).fill({ id: 2, type: 'steps', value: 2000 }),
          hasMoreData: false,
          nextIndex: 150,
          completedPercentage: 100,
        },
      });

    const { getByText } = render(<DataMigrationScreen />);
    
    const startButton = getByText('データの移行');
    fireEvent.press(startButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '移行完了',
        expect.stringContaining('取得データ: 150件'),
        expect.any(Array)
      );
    }, { timeout: 5000 });

    expect(mockApi.getMigrationData).toHaveBeenCalledTimes(2);
  });
});