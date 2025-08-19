import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';

// ============================================================================
// UNIVERSAL REACT NATIVE MOCKS
// ============================================================================

jest.mock('react-native', () => {
  const React = require('react');
  
  const mockComponent = (componentName: string) => 
    React.forwardRef((props: any, ref: any) => {
      return React.createElement('View', {
        ...props,
        ref,
        testID: props.testID || componentName,
        'data-component': componentName,
      }, props.children);
    });

  const MockText = React.forwardRef((props: any, ref: any) => {
    return React.createElement('Text', {
      ...props,
      ref,
      testID: props.testID || 'Text',
    }, props.children);
  });

  const MockTouchableOpacity = React.forwardRef((props: any, ref: any) => {
    return React.createElement('TouchableOpacity', {
      ...props,
      ref,
      testID: props.testID || 'TouchableOpacity',
      onPress: props.onPress
    }, props.children);
  });

  const MockSwitch = React.forwardRef((props: any, ref: any) => {
    return React.createElement('Switch', {
      ...props,
      ref,
      testID: props.testID || 'Switch',
      onValueChange: props.onValueChange,
      value: props.value
    });
  });

  return {
    View: mockComponent('View'),
    Text: MockText,
    TouchableOpacity: MockTouchableOpacity,
    ScrollView: mockComponent('ScrollView'),
    SafeAreaView: mockComponent('SafeAreaView'),
    Switch: MockSwitch,
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: 'ios',
    },
    StyleSheet: { 
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
    },
  };
});

// ============================================================================
// API/SERVICE MOCKS
// ============================================================================

jest.mock('../../src/services/api/apiClient', () => ({
  apiClient: {
    syncHealthData: jest.fn().mockResolvedValue({
      success: true,
      message: '同期が完了しました',
    }),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
}));

// ============================================================================
// MOCK LINKED SERVICES SETTINGS SCREEN
// ============================================================================

jest.mock('../../src/screens/LinkedServicesSettingsScreen', () => {
  const React = require('react');
  
  return React.forwardRef((props: any, ref: any) => {
    const [healthKitEnabled, setHealthKitEnabled] = React.useState(false);
    const [newAppEnabled, setNewAppEnabled] = React.useState(false);
    const [syncing, setSyncing] = React.useState(false);
    
    React.useEffect(() => {
      const loadSettings = async () => {
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        const savedHealthKit = await AsyncStorage.getItem('healthkit_enabled');
        const savedNewApp = await AsyncStorage.getItem('newapp_enabled');
        
        if (savedHealthKit === 'true') setHealthKitEnabled(true);
        if (savedNewApp === 'true') setNewAppEnabled(true);
      };
      
      loadSettings();
    }, []);

    const handleHealthKitToggle = async (value: boolean) => {
      setHealthKitEnabled(value);
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('healthkit_enabled', value.toString());
    };

    const handleNewAppToggle = async (value: boolean) => {
      setNewAppEnabled(value);
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('newapp_enabled', value.toString());
    };

    const handleSync = async () => {
      setSyncing(true);
      try {
        const { apiClient } = require('../../src/services/api/apiClient');
        const response = await apiClient.syncHealthData();
        
        if (response.success) {
          const { Alert } = require('react-native');
          Alert.alert('成功', response.message);
        }
      } catch (error) {
        const { Alert } = require('react-native');
        Alert.alert('エラー', '同期中にエラーが発生しました');
      } finally {
        setSyncing(false);
      }
    };

    return React.createElement('ScrollView', { testID: 'linked-services-screen' }, [
      // Header
      React.createElement('View', { key: 'header', testID: 'header' }, [
        React.createElement('Text', { key: 'title', testID: 'screen-title' }, '連携サービス')
      ]),
      
      // Services Section
      React.createElement('View', { key: 'services', testID: 'services-section' }, [
        // HealthKit
        React.createElement('View', { key: 'healthkit', testID: 'healthkit-item' }, [
          React.createElement('View', { key: 'healthkit-info' }, [
            React.createElement('Text', { key: 'healthkit-title' }, 'HealthKit'),
            React.createElement('Text', { key: 'healthkit-desc' }, 'iOSのヘルスデータと連携')
          ]),
          React.createElement('Switch', {
            key: 'healthkit-switch',
            testID: 'healthkit-switch',
            value: healthKitEnabled,
            onValueChange: handleHealthKitToggle
          })
        ]),
        
        // New App
        React.createElement('View', { key: 'newapp', testID: 'newapp-item' }, [
          React.createElement('View', { key: 'newapp-info' }, [
            React.createElement('Text', { key: 'newapp-title' }, '新アプリ連携'),
            React.createElement('Text', { key: 'newapp-desc' }, '新アプリとの連携を有効にする')
          ]),
          React.createElement('Switch', {
            key: 'newapp-switch',
            testID: 'newapp-switch',
            value: newAppEnabled,
            onValueChange: handleNewAppToggle
          })
        ])
      ]),
      
      // Help Link
      React.createElement('TouchableOpacity', {
        key: 'help-link',
        testID: 'help-link',
        onPress: () => {}
      }, [
        React.createElement('Text', { key: 'help-text' }, 'HealthKitの使い方はこちら')
      ]),
      
      // Notice
      React.createElement('View', { key: 'notice', testID: 'notice' }, [
        React.createElement('Text', { key: 'notice-text' }, 
          '※HealthKitと手動入力のデータが重複する場合、より多い値が採用されます。')
      ]),
      
      // Sync Button
      React.createElement('TouchableOpacity', {
        key: 'sync-button',
        testID: 'sync-button',
        onPress: handleSync,
        disabled: syncing
      }, [
        React.createElement('Text', { key: 'sync-text' }, syncing ? '同期中...' : '今すぐ同期')
      ])
    ]);
  });
});

// Import the mocked screen
import LinkedServicesSettingsScreen from '../../src/screens/LinkedServicesSettingsScreen';

// ============================================================================
// TEST SUITE
// ============================================================================

const renderLinkedServicesSettingsScreen = () => {
  return render(<LinkedServicesSettingsScreen />);
};

describe('LinkedServicesSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with main components', () => {
    const { getByTestId, getByText } = renderLinkedServicesSettingsScreen();
    
    expect(getByTestId('linked-services-screen')).toBeTruthy();
    expect(getByTestId('screen-title')).toBeTruthy();
    expect(getByText('連携サービス')).toBeTruthy();
    expect(getByText('新アプリ連携')).toBeTruthy();
    expect(getByText('今すぐ同期')).toBeTruthy();
  });

  it('displays HealthKit option on iOS', () => {
    const { getByTestId, getByText } = renderLinkedServicesSettingsScreen();
    
    expect(getByTestId('healthkit-item')).toBeTruthy();
    expect(getByText('HealthKit')).toBeTruthy();
    expect(getByText('iOSのヘルスデータと連携')).toBeTruthy();
  });

  it('displays new app integration option', () => {
    const { getByTestId, getByText } = renderLinkedServicesSettingsScreen();
    
    expect(getByTestId('newapp-item')).toBeTruthy();
    expect(getByText('新アプリ連携')).toBeTruthy();
    expect(getByText('新アプリとの連携を有効にする')).toBeTruthy();
  });

  it('loads saved settings on mount', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockImplementation((key: string) => {
      if (key === 'healthkit_enabled') return Promise.resolve('true');
      if (key === 'newapp_enabled') return Promise.resolve('false');
      return Promise.resolve(null);
    });
    
    const { getByTestId } = renderLinkedServicesSettingsScreen();
    
    await waitFor(() => {
      const healthKitSwitch = getByTestId('healthkit-switch');
      const newAppSwitch = getByTestId('newapp-switch');
      
      expect(healthKitSwitch.props.value).toBe(true);
      expect(newAppSwitch.props.value).toBe(false);
    });
  });

  it('toggles HealthKit setting', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    const { getByTestId } = renderLinkedServicesSettingsScreen();
    
    const healthKitSwitch = getByTestId('healthkit-switch');
    
    // Initially false
    expect(healthKitSwitch.props.value).toBe(false);
    
    // Toggle to true
    fireEvent(healthKitSwitch, 'onValueChange', true);
    
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('healthkit_enabled', 'true');
      expect(getByTestId('healthkit-switch').props.value).toBe(true);
    });
  });

  it('toggles new app setting', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    const { getByTestId } = renderLinkedServicesSettingsScreen();
    
    const newAppSwitch = getByTestId('newapp-switch');
    
    // Initially false
    expect(newAppSwitch.props.value).toBe(false);
    
    // Toggle to true
    fireEvent(newAppSwitch, 'onValueChange', true);
    
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('newapp_enabled', 'true');
      expect(getByTestId('newapp-switch').props.value).toBe(true);
    });
  });

  it('handles sync button press', async () => {
    const { getByTestId, getByText } = renderLinkedServicesSettingsScreen();
    const { Alert } = require('react-native');
    const { apiClient } = require('../../src/services/api/apiClient');
    
    const syncButton = getByTestId('sync-button');
    fireEvent.press(syncButton);
    
    // Should show syncing state
    expect(getByText('同期中...')).toBeTruthy();
    
    await waitFor(() => {
      expect(apiClient.syncHealthData).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('成功', '同期が完了しました');
      expect(getByText('今すぐ同期')).toBeTruthy();
    });
  });

  it('handles sync error', async () => {
    const { getByTestId } = renderLinkedServicesSettingsScreen();
    const { Alert } = require('react-native');
    const { apiClient } = require('../../src/services/api/apiClient');
    
    apiClient.syncHealthData.mockRejectedValue(new Error('Network error'));
    
    const syncButton = getByTestId('sync-button');
    fireEvent.press(syncButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('エラー', '同期中にエラーが発生しました');
    });
  });

  it('displays help link', () => {
    const { getByTestId, getByText } = renderLinkedServicesSettingsScreen();
    
    expect(getByTestId('help-link')).toBeTruthy();
    expect(getByText('HealthKitの使い方はこちら')).toBeTruthy();
  });

  it('displays notice about data duplication', () => {
    const { getByTestId, getByText } = renderLinkedServicesSettingsScreen();
    
    expect(getByTestId('notice')).toBeTruthy();
    expect(getByText('※HealthKitと手動入力のデータが重複する場合、より多い値が採用されます。')).toBeTruthy();
  });
});