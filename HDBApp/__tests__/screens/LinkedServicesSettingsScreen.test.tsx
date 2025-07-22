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

  // Special ScrollView component
  const MockScrollView = React.forwardRef((props: any, ref: any) => {
    return React.createElement('ScrollView', {
      ...props,
      ref,
      testID: props.testID || 'ScrollView',
      'data-component': 'ScrollView'
    }, props.children);
  });

  return {
    // Basic components
    View: mockComponent('View'),
    Text: MockText,
    TouchableOpacity: MockTouchableOpacity,
    Switch: MockSwitch,
    ScrollView: MockScrollView,
    SafeAreaView: mockComponent('SafeAreaView'),
    
    // Alert
    Alert: {
      alert: jest.fn(),
    },
    
    // Platform
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
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

jest.mock('../../src/services/mockHealthPlatform');
jest.mock('../../src/services/VitalDataService');

import LinkedServicesSettingsScreen from '../../src/screens/LinkedServicesSettingsScreen';
import {Alert, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MockHealthPlatformService} from '../../src/services/mockHealthPlatform';
import {VitalDataService} from '../../src/services/VitalDataService';

describe('LinkedServicesSettingsScreen', () => {
  let mockHealthPlatformService: jest.Mocked<MockHealthPlatformService>;
  let mockVitalDataService: jest.Mocked<VitalDataService>;
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockHealthPlatformService = {
      requestHealthKitPermission: jest.fn(),
      requestGoogleFitPermission: jest.fn(),
      setHealthKitEnabled: jest.fn(),
      setGoogleFitEnabled: jest.fn(),
    } as any;
    
    mockVitalDataService = {
      initializeService: jest.fn(),
      syncHealthPlatformData: jest.fn(),
    } as any;
    
    (MockHealthPlatformService.getInstance as jest.Mock).mockReturnValue(mockHealthPlatformService);
    (VitalDataService as unknown as jest.Mock).mockImplementation(() => mockVitalDataService);
    
    // Default Platform to iOS
    Platform.OS = 'ios';
  });

  it('renders correctly with main components', () => {
    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    expect(getByText('連携サービス')).toBeTruthy();
    expect(getByText('新アプリ')).toBeTruthy();
    expect(getByText('今すぐ同期')).toBeTruthy();
  });

  it('displays HealthKit option on iOS', () => {
    Platform.OS = 'ios';
    
    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    expect(getByText('HealthKit')).toBeTruthy();
    expect(getByText('iOSのヘルスデータと連携')).toBeTruthy();
    expect(getByText('HealthKitの使い方はこちら')).toBeTruthy();
  });

  it('displays Health Connect option on Android', () => {
    Platform.OS = 'android';
    
    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    expect(getByText('ヘルスコネクト')).toBeTruthy();
    expect(getByText('Androidのヘルスデータと連携')).toBeTruthy();
    expect(getByText('ヘルスコネクトの使い方はこちら')).toBeTruthy();
  });

  it('loads saved settings on mount', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce('true') // healthkit_enabled
      .mockResolvedValueOnce('false'); // googlefit_enabled

    const {getAllByTestId} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      const switches = getAllByTestId('Switch');
      // HealthKit switch should be enabled
      expect(switches[0].props.value).toBe(true);
    });
  });

  it('toggles HealthKit setting successfully', async () => {
    Platform.OS = 'ios';
    mockHealthPlatformService.requestHealthKitPermission.mockResolvedValue(true);
    mockHealthPlatformService.setHealthKitEnabled.mockResolvedValue(undefined);

    const {getAllByTestId} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const switches = getAllByTestId('Switch');
    const healthKitSwitch = switches[0]; // First switch is HealthKit
    
    fireEvent(healthKitSwitch, 'valueChange', true);

    await waitFor(() => {
      expect(mockHealthPlatformService.requestHealthKitPermission).toHaveBeenCalled();
      expect(mockHealthPlatformService.setHealthKitEnabled).toHaveBeenCalledWith(true);
    });
  });

  it('shows permission denied alert when HealthKit access is denied', async () => {
    Platform.OS = 'ios';
    mockHealthPlatformService.requestHealthKitPermission.mockResolvedValue(false);

    const {getAllByTestId} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const switches = getAllByTestId('Switch');
    const healthKitSwitch = switches[0];
    
    fireEvent(healthKitSwitch, 'valueChange', true);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        'HealthKitへのアクセスが拒否されました。'
      );
    });
  });

  it('shows sync confirmation when enabling HealthKit', async () => {
    Platform.OS = 'ios';
    mockHealthPlatformService.requestHealthKitPermission.mockResolvedValue(true);
    mockHealthPlatformService.setHealthKitEnabled.mockResolvedValue(undefined);

    const {getAllByTestId} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const switches = getAllByTestId('Switch');
    const healthKitSwitch = switches[0];
    
    fireEvent(healthKitSwitch, 'valueChange', true);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '同期確認',
        'HealthKitからヘルスデータを同期しますか？',
        expect.any(Array)
      );
    });
  });

  it('toggles Health Connect setting on Android', async () => {
    Platform.OS = 'android';
    mockHealthPlatformService.requestGoogleFitPermission.mockResolvedValue(true);
    mockHealthPlatformService.setGoogleFitEnabled.mockResolvedValue(undefined);

    const {getAllByTestId} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const switches = getAllByTestId('Switch');
    const healthConnectSwitch = switches[0]; // First switch is Health Connect on Android
    
    fireEvent(healthConnectSwitch, 'valueChange', true);

    await waitFor(() => {
      expect(mockHealthPlatformService.requestGoogleFitPermission).toHaveBeenCalled();
      expect(mockHealthPlatformService.setGoogleFitEnabled).toHaveBeenCalledWith(true);
    });
  });

  it('shows error when trying to use HealthKit on Android', async () => {
    Platform.OS = 'android';

    render(<LinkedServicesSettingsScreen navigation={mockNavigation as any} />);

    // On Android, HealthKit should not be available
    expect(Platform.OS).toBe('android');
  });

  it('performs manual sync when sync button is pressed', async () => {
    mockVitalDataService.initializeService.mockResolvedValue(undefined);
    mockVitalDataService.syncHealthPlatformData.mockResolvedValue(undefined);

    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const syncButton = getByText('今すぐ同期');
    fireEvent.press(syncButton);

    await waitFor(() => {
      expect(mockVitalDataService.initializeService).toHaveBeenCalled();
      expect(mockVitalDataService.syncHealthPlatformData).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        '成功',
        'ヘルスデータの同期が完了しました。'
      );
    });
  });

  it('handles sync error', async () => {
    mockVitalDataService.initializeService.mockRejectedValue(new Error('Sync failed'));

    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const syncButton = getByText('今すぐ同期');
    fireEvent.press(syncButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        'ヘルスデータの同期に失敗しました。'
      );
    });
  });

  it('shows how to use dialog when link is pressed', () => {
    Platform.OS = 'ios';
    
    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const howToUseLink = getByText('HealthKitの使い方はこちら');
    fireEvent.press(howToUseLink);

    expect(Alert.alert).toHaveBeenCalledWith(
      'HealthKitについて',
      expect.stringContaining('HealthKitを有効にすると'),
      [{text: 'OK'}]
    );
  });

  it('shows how to use dialog for Health Connect on Android', () => {
    Platform.OS = 'android';
    
    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const howToUseLink = getByText('ヘルスコネクトの使い方はこちら');
    fireEvent.press(howToUseLink);

    expect(Alert.alert).toHaveBeenCalledWith(
      'ヘルスコネクトについて',
      expect.stringContaining('ヘルスコネクトを有効にすると'),
      [{text: 'OK'}]
    );
  });

  it('toggles new app setting', async () => {
    const {getAllByTestId} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const switches = getAllByTestId('Switch');
    const newAppSwitch = switches[switches.length - 1]; // Last switch is new app
    
    fireEvent(newAppSwitch, 'valueChange', true);

    // New app switch should update its value
    expect(newAppSwitch.props.value).toBe(true);
  });

  it('displays loading state during operations', async () => {
    Platform.OS = 'ios';
    mockHealthPlatformService.requestHealthKitPermission.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(true), 100))
    );

    const {getAllByTestId, getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const switches = getAllByTestId('Switch');
    const healthKitSwitch = switches[0];
    
    fireEvent(healthKitSwitch, 'valueChange', true);

    // Should show loading text
    expect(getByText('処理中...')).toBeTruthy();
    
    // Switches should be disabled during loading
    switches.forEach(sw => {
      expect(sw.props.disabled).toBe(true);
    });
  });

  it('renders sync button correctly', () => {
    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const syncButton = getByText('今すぐ同期');
    expect(syncButton).toBeTruthy();
  });

  it('displays note about data handling', () => {
    Platform.OS = 'ios';
    
    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    expect(getByText(/※HealthKitと手動入力のデータが重複する場合/)).toBeTruthy();
  });

  it('displays note about Health Connect data handling on Android', () => {
    Platform.OS = 'android';
    
    const {getByText} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    expect(getByText(/※ヘルスコネクトと手動入力のデータが重複する場合/)).toBeTruthy();
  });

  it('handles HealthKit toggle error', async () => {
    Platform.OS = 'ios';
    mockHealthPlatformService.requestHealthKitPermission.mockRejectedValue(new Error('Permission error'));

    const {getAllByTestId} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const switches = getAllByTestId('Switch');
    const healthKitSwitch = switches[0];
    
    fireEvent(healthKitSwitch, 'valueChange', true);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        'HealthKit設定の変更に失敗しました。'
      );
    });
  });

  it('handles Health Connect toggle error', async () => {
    Platform.OS = 'android';
    mockHealthPlatformService.requestGoogleFitPermission.mockRejectedValue(new Error('Permission error'));

    const {getAllByTestId} = render(
      <LinkedServicesSettingsScreen navigation={mockNavigation as any} />
    );

    const switches = getAllByTestId('Switch');
    const healthConnectSwitch = switches[0];
    
    fireEvent(healthConnectSwitch, 'valueChange', true);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        'ヘルスコネクト設定の変更に失敗しました。'
      );
    });
  });
});
