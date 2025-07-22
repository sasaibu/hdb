import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import DataMigrationScreen from '../../src/screens/DataMigrationScreen';
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
const mockNavigate = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
  navigate: mockNavigate,
};

// Mock route params
const mockRoute = {
  params: {
    migrationToken: 'test-migration-token-123',
    sourceSystem: 'legacy-hdb',
  },
};

describe('DataMigrationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const {getByText} = render(
      <DataMigrationScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any}
      />
    );

    expect(getByText('データ移行')).toBeTruthy();
    expect(getByText('戻る')).toBeTruthy();
    expect(getByText('移行開始')).toBeTruthy();
  });

  it('displays migration information', () => {
    const {getByText} = render(
      <DataMigrationScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any}
      />
    );

    expect(getByText('移行元システム')).toBeTruthy();
    expect(getByText('legacy-hdb')).toBeTruthy();
    expect(getByText('移行対象データ')).toBeTruthy();
    expect(getByText(/バイタルデータ/)).toBeTruthy();
    expect(getByText(/ユーザー設定/)).toBeTruthy();
    expect(getByText(/目標設定/)).toBeTruthy();
  });

  it('checks for existing data on mount', async () => {
    (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
      'vital_data',
      'user_settings',
    ]);

    const {getByText} = render(
      <DataMigrationScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any}
      />
    );

    await waitFor(() => {
      expect(getByText('既存データの確認')).toBeTruthy();
      expect(getByText(/現在のアプリにデータが存在します/)).toBeTruthy();
    });
  });

  it('shows migration confirmation when start button is pressed', () => {
    const {getByText} = render(
      <DataMigrationScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any}
      />
    );

    const startButton = getByText('移行開始');
    fireEvent.press(startButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      '移行の確認',
      expect.stringContaining('データ移行を開始しますか？'),
      expect.any(Array)
    );
  });

  it('performs migration when confirmed', async () => {
    const {getByText} = render(
      <DataMigrationScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any}
      />
    );

    const startButton = getByText('移行開始');
    fireEvent.press(startButton);

    // Confirm migration
    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = alertButtons.find((btn: any) => btn.text === '移行する');
    confirmButton.onPress();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '成功',
        'データ移行が完了しました',
        expect.any(Array)
      );
    });
  });

  it('shows progress during migration', async () => {
    const {getByText, getByTestId} = render(
      <DataMigrationScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any}
      />
    );

    const startButton = getByText('移行開始');
    fireEvent.press(startButton);

    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = alertButtons.find((btn: any) => btn.text === '移行する');
    confirmButton.onPress();

    // Check for progress indicator
    expect(getByTestId('migration-progress')).toBeTruthy();
    expect(getByText('データを移行中...')).toBeTruthy();
  });

  it('displays migration progress steps', async () => {
    const {getByText} = render(
      <DataMigrationScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any}
      />
    );

    const startButton = getByText('移行開始');
    fireEvent.press(startButton);

    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = alertButtons.find((btn: any) => btn.text === '移行する');
    confirmButton.onPress();

    await waitFor(() => {
      expect(getByText(/認証確認/)).toBeTruthy();
      expect(getByText(/データ取得/)).toBeTruthy();
      expect(getByText(/データ変換/)).toBeTruthy();
      expect(getByText(/データ保存/)).toBeTruthy();
    });
  });

  it('handles migration error gracefully', async () => {
    // Mock API error
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const {getByText} = render(
      <DataMigrationScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any}
      />
    );

    const startButton = getByText('移行開始');
    fireEvent.press(startButton);

    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = alertButtons.find((btn: any) => btn.text === '移行する');
    confirmButton.onPress();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        expect.stringContaining('データ移行に失敗しました'),
        expect.any(Array)
      );
    });
  });

  it('navigates back when back button is pressed', () => {
    const {getByText} = render(
      <DataMigrationScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any}
      />
    );

    const backButton = getByText('戻る');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('navigates to home after successful migration', async () => {
    const {getByText} = render(
      <DataMigrationScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any}
      />
    );

    const startButton = getByText('移行開始');
    fireEvent.press(startButton);

    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = alertButtons.find((btn: any) => btn.text === '移行する');
    confirmButton.onPress();

    await waitFor(() => {
      const successAlertButtons = (Alert.alert as jest.Mock).mock.calls[1][2];
      const okButton = successAlertButtons[0];
      okButton.onPress();
      
      expect(mockNavigate).toHaveBeenCalledWith('Main');
    });
  });

  it('shows warning for large data migration', async () => {
    // Mock large data response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        dataSize: 10485760, // 10MB
        recordCount: 10000,
      }),
    });

    const {getByText} = render(
      <DataMigrationScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any}
      />
    );

    await waitFor(() => {
      expect(getByText(/大量のデータ/)).toBeTruthy();
      expect(getByText(/10.0 MB/)).toBeTruthy();
      expect(getByText(/10,000 件/)).toBeTruthy();
    });
  });

  it('validates migration token', async () => {
    const invalidRoute = {
      params: {
        migrationToken: '',
        sourceSystem: 'legacy-hdb',
      },
    };

    const {getByText} = render(
      <DataMigrationScreen 
        navigation={mockNavigation as any} 
        route={invalidRoute as any}
      />
    );

    expect(getByText(/無効な移行トークン/)).toBeTruthy();
    expect(getByText('移行開始').props.disabled).toBe(true);
  });

  it('handles partial migration success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        partial: true,
        migrated: 80,
        failed: 20,
      }),
    });

    const {getByText} = render(
      <DataMigrationScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any}
      />
    );

    const startButton = getByText('移行開始');
    fireEvent.press(startButton);

    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = alertButtons.find((btn: any) => btn.text === '移行する');
    confirmButton.onPress();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '部分的な成功',
        expect.stringContaining('80件のデータが移行されました'),
        expect.any(Array)
      );
    });
  });

  it('allows retry on failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const {getByText} = render(
      <DataMigrationScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any}
      />
    );

    const startButton = getByText('移行開始');
    fireEvent.press(startButton);

    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = alertButtons.find((btn: any) => btn.text === '移行する');
    confirmButton.onPress();

    await waitFor(() => {
      const errorAlertButtons = (Alert.alert as jest.Mock).mock.calls[1][2];
      const retryButton = errorAlertButtons.find((btn: any) => btn.text === '再試行');
      expect(retryButton).toBeTruthy();
    });
  });
});