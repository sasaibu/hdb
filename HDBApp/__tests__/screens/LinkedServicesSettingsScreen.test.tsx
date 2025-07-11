import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import LinkedServicesSettingsScreen from '../../src/screens/LinkedServicesSettingsScreen';
import {Alert, Platform, Linking} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
  canOpenURL: jest.fn().mockResolvedValue(true),
}));

jest.spyOn(Alert, 'alert');

const mockGoBack = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
};

describe('LinkedServicesSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios'; // Default to iOS for testing
  });

  it('renders correctly', () => {
    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    expect(getByText('連携サービス設定')).toBeTruthy();
    expect(getByText('戻る')).toBeTruthy();
  });

  it('displays HealthKit option on iOS', () => {
    Platform.OS = 'ios';
    
    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    expect(getByText('HealthKit')).toBeTruthy();
    expect(getByText('iOSのヘルスアプリと連携')).toBeTruthy();
  });

  it('displays Google Fit option on Android', () => {
    Platform.OS = 'android';
    
    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    expect(getByText('Google Fit')).toBeTruthy();
    expect(getByText('Google Fitと連携')).toBeTruthy();
  });

  it('loads saved settings on mount', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        healthKitEnabled: true,
        googleFitEnabled: false,
      })
    );

    const {getByTestId} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      const healthKitSwitch = getByTestId('healthkit-switch');
      expect(healthKitSwitch.props.value).toBe(true);
    });
  });

  it('toggles HealthKit setting', async () => {
    Platform.OS = 'ios';
    
    const {getByTestId} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const healthKitSwitch = getByTestId('healthkit-switch');
    fireEvent(healthKitSwitch, 'valueChange', true);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'linked_services_settings',
        expect.stringContaining('"healthKitEnabled":true')
      );
    });
  });

  it('shows permission request when enabling HealthKit', async () => {
    Platform.OS = 'ios';
    
    const {getByTestId} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const healthKitSwitch = getByTestId('healthkit-switch');
    fireEvent(healthKitSwitch, 'valueChange', true);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '権限の確認',
        expect.stringContaining('HealthKitへのアクセス'),
        expect.any(Array)
      );
    });
  });

  it('handles permission denial', async () => {
    Platform.OS = 'ios';
    
    const {getByTestId} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const healthKitSwitch = getByTestId('healthkit-switch');
    fireEvent(healthKitSwitch, 'valueChange', true);

    // Deny permission
    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const cancelButton = alertButtons.find((btn: any) => btn.text === 'キャンセル');
    cancelButton.onPress();

    await waitFor(() => {
      expect(healthKitSwitch.props.value).toBe(false);
    });
  });

  it('opens settings when permission is required', async () => {
    Platform.OS = 'ios';
    
    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const settingsButton = getByText('設定を開く');
    fireEvent.press(settingsButton);

    expect(Linking.openURL).toHaveBeenCalledWith('app-settings:');
  });

  it('displays sync status', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        healthKitEnabled: true,
        lastSync: '2025-07-11T10:00:00Z',
      })
    );

    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText(/最終同期:/)).toBeTruthy();
      expect(getByText(/2025年7月11日/)).toBeTruthy();
    });
  });

  it('shows sync now button when service is enabled', async () => {
    Platform.OS = 'ios';
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        healthKitEnabled: true,
      })
    );

    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('今すぐ同期')).toBeTruthy();
    });
  });

  it('performs manual sync', async () => {
    Platform.OS = 'ios';
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        healthKitEnabled: true,
      })
    );

    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      const syncButton = getByText('今すぐ同期');
      fireEvent.press(syncButton);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '同期完了',
        'データの同期が完了しました'
      );
    });
  });

  it('handles sync error', async () => {
    Platform.OS = 'ios';
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        healthKitEnabled: true,
      })
    );

    // Mock sync error
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Sync failed'));

    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      const syncButton = getByText('今すぐ同期');
      fireEvent.press(syncButton);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        '同期に失敗しました'
      );
    });
  });

  it('navigates back when back button is pressed', () => {
    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const backButton = getByText('戻る');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('shows sync frequency settings', () => {
    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    expect(getByText('同期頻度')).toBeTruthy();
    expect(getByText('1時間ごと')).toBeTruthy();
    expect(getByText('6時間ごと')).toBeTruthy();
    expect(getByText('1日ごと')).toBeTruthy();
    expect(getByText('手動のみ')).toBeTruthy();
  });

  it('updates sync frequency', async () => {
    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const frequencyOption = getByText('6時間ごと');
    fireEvent.press(frequencyOption);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'linked_services_settings',
        expect.stringContaining('"syncFrequency":"6hours"')
      );
    });
  });

  it('displays data types to sync', () => {
    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    expect(getByText('同期するデータ')).toBeTruthy();
    expect(getByText('歩数')).toBeTruthy();
    expect(getByText('体重')).toBeTruthy();
    expect(getByText('心拍数')).toBeTruthy();
    expect(getByText('血圧')).toBeTruthy();
  });

  it('toggles data type sync settings', async () => {
    const {getByTestId} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const stepsSwitch = getByTestId('sync-steps-switch');
    fireEvent(stepsSwitch, 'valueChange', false);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'linked_services_settings',
        expect.stringContaining('"syncSteps":false')
      );
    });
  });

  it('shows warning when disabling all data types', async () => {
    const {getAllByTestId} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const switches = getAllByTestId(/sync-.*-switch/);
    
    // Disable all switches
    switches.forEach(sw => {
      fireEvent(sw, 'valueChange', false);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '警告',
        '少なくとも1つのデータタイプを選択してください'
      );
    });
  });
});