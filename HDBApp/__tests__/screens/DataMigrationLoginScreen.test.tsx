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

  // Special TextInput that handles text changes
  const MockTextInput = React.forwardRef((props: any, ref: any) => {
    return React.createElement('TextInput', {
      ...props,
      ref,
      testID: props.testID || 'TextInput',
      'data-component': 'TextInput',
      onChangeText: props.onChangeText,
      placeholder: props.placeholder,
      secureTextEntry: props.secureTextEntry,
      value: props.value
    });
  });

  // Special ActivityIndicator component
  const MockActivityIndicator = React.forwardRef((props: any, ref: any) => {
    return React.createElement('ActivityIndicator', {
      ...props,
      ref,
      testID: props.testID || 'ActivityIndicator',
      'data-component': 'ActivityIndicator'
    });
  });

  // Special KeyboardAvoidingView component
  const MockKeyboardAvoidingView = React.forwardRef((props: any, ref: any) => {
    return React.createElement('KeyboardAvoidingView', {
      ...props,
      ref,
      testID: props.testID || 'KeyboardAvoidingView',
      'data-component': 'KeyboardAvoidingView'
    }, props.children);
  });

  return {
    // Basic components
    View: mockComponent('View'),
    Text: MockText,
    TouchableOpacity: MockTouchableOpacity,
    TextInput: MockTextInput,
    ActivityIndicator: MockActivityIndicator,
    KeyboardAvoidingView: MockKeyboardAvoidingView,
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
jest.mock('../../src/services/api/apiClient');

import DataMigrationLoginScreen from '../../src/screens/DataMigrationLoginScreen';
import {Alert} from 'react-native';
import {apiClient} from '../../src/services/api/apiClient';

describe('DataMigrationLoginScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with main components', () => {
    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    expect(getByText('データ移行ログイン')).toBeTruthy();
    expect(getByText('データ移行を行うにはログインが必要です')).toBeTruthy();
    expect(getByText('ユーザーID')).toBeTruthy();
    expect(getByText('パスワード')).toBeTruthy();
    expect(getByPlaceholderText('データ移行用ユーザーIDを入力')).toBeTruthy();
    expect(getByPlaceholderText('データ移行用パスワードを入力')).toBeTruthy();
    expect(getByText('ログイン')).toBeTruthy();
  });

  it('handles user input correctly', () => {
    const {getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('データ移行用ユーザーIDを入力');
    const passwordInput = getByPlaceholderText('データ移行用パスワードを入力');

    fireEvent.changeText(userIdInput, 'testuser');
    fireEvent.changeText(passwordInput, 'testpass');

    expect(userIdInput.props.value).toBe('testuser');
    expect(passwordInput.props.value).toBe('testpass');
  });

  it('validates empty user ID', async () => {
    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const passwordInput = getByPlaceholderText('データ移行用パスワードを入力');
    fireEvent.changeText(passwordInput, 'testpass');

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    expect(Alert.alert).toHaveBeenCalledWith('エラー', 'ユーザーIDを入力してください');
  });

  it('validates empty password', async () => {
    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('データ移行用ユーザーIDを入力');
    fireEvent.changeText(userIdInput, 'testuser');

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    expect(Alert.alert).toHaveBeenCalledWith('エラー', 'パスワードを入力してください');
  });

  it('handles successful login with data', async () => {
    (apiClient.migrationAuth as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        migrationToken: 'test-token-123',
        userData: {
          hasData: true,
          vitalsCount: 150,
        },
      },
    });

    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('データ移行用ユーザーIDを入力');
    const passwordInput = getByPlaceholderText('データ移行用パスワードを入力');

    fireEvent.changeText(userIdInput, 'testuser');
    fireEvent.changeText(passwordInput, 'testpass');

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(apiClient.migrationAuth).toHaveBeenCalledWith('testuser', 'testpass');
      expect(Alert.alert).toHaveBeenCalledWith(
        '成功',
        'データ移行ログインに成功しました。\n移行可能なデータ: 150件',
        expect.any(Array)
      );
    });
  });

  it('handles successful login without data', async () => {
    (apiClient.migrationAuth as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        migrationToken: 'test-token-123',
        userData: {
          hasData: false,
          vitalsCount: 0,
        },
      },
    });

    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('データ移行用ユーザーIDを入力');
    const passwordInput = getByPlaceholderText('データ移行用パスワードを入力');

    fireEvent.changeText(userIdInput, 'testuser');
    fireEvent.changeText(passwordInput, 'testpass');

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('確認', '移行可能なデータがありません');
    });
  });

  it('handles login failure', async () => {
    (apiClient.migrationAuth as jest.Mock).mockResolvedValue({
      success: false,
      message: 'ユーザーIDまたはパスワードが異なります',
    });

    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('データ移行用ユーザーIDを入力');
    const passwordInput = getByPlaceholderText('データ移行用パスワードを入力');

    fireEvent.changeText(userIdInput, 'wronguser');
    fireEvent.changeText(passwordInput, 'wrongpass');

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        'ユーザーIDまたはパスワードが異なります'
      );
    });
  });

  it('handles network error', async () => {
    (apiClient.migrationAuth as jest.Mock).mockRejectedValue(new Error('Network error'));

    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('データ移行用ユーザーIDを入力');
    const passwordInput = getByPlaceholderText('データ移行用パスワードを入力');

    fireEvent.changeText(userIdInput, 'testuser');
    fireEvent.changeText(passwordInput, 'testpass');

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        'ログイン中にエラーが発生しました'
      );
    });
  });

  it('shows loading state during login', async () => {
    (apiClient.migrationAuth as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        success: true,
        data: { migrationToken: 'test', userData: { hasData: true, vitalsCount: 10 } }
      }), 100))
    );

    const {getByText, getByPlaceholderText, getAllByTestId} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('データ移行用ユーザーIDを入力');
    const passwordInput = getByPlaceholderText('データ移行用パスワードを入力');

    fireEvent.changeText(userIdInput, 'testuser');
    fireEvent.changeText(passwordInput, 'testpass');

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    // Should show loading indicator
    const indicators = getAllByTestId('ActivityIndicator');
    expect(indicators.length).toBeGreaterThan(0);
  });

  it('navigates to DataMigration screen on successful login with data', async () => {
    (apiClient.migrationAuth as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        migrationToken: 'test-token-123',
        userData: {
          hasData: true,
          vitalsCount: 150,
        },
      },
    });

    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('データ移行用ユーザーIDを入力');
    const passwordInput = getByPlaceholderText('データ移行用パスワードを入力');

    fireEvent.changeText(userIdInput, 'testuser');
    fireEvent.changeText(passwordInput, 'testpass');

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });

    // Simulate pressing OK on the success alert
    const alertCall = (Alert.alert as jest.Mock).mock.calls.find(call => 
      call[0] === '成功'
    );
    if (alertCall && alertCall[2] && alertCall[2][0] && alertCall[2][0].onPress) {
      alertCall[2][0].onPress();
    }

    expect(mockNavigation.replace).toHaveBeenCalledWith('DataMigration', {
      migrationToken: 'test-token-123',
      sourceSystem: 'legacy-hdb',
    });
  });

  it('has secure text entry for password field', () => {
    const {getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const passwordInput = getByPlaceholderText('データ移行用パスワードを入力');
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('validates inputs with whitespace', async () => {
    (apiClient.migrationAuth as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        migrationToken: 'test-token',
        userData: { hasData: true, vitalsCount: 10 },
      },
    });

    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('データ移行用ユーザーIDを入力');
    const passwordInput = getByPlaceholderText('データ移行用パスワードを入力');

    fireEvent.changeText(userIdInput, '  testuser  ');
    fireEvent.changeText(passwordInput, '  testpass  ');

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(apiClient.migrationAuth).toHaveBeenCalledWith('  testuser  ', '  testpass  ');
    });
  });

  it('handles API response without data field', async () => {
    (apiClient.migrationAuth as jest.Mock).mockResolvedValue({
      success: false,
    });

    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('データ移行用ユーザーIDを入力');
    const passwordInput = getByPlaceholderText('データ移行用パスワードを入力');

    fireEvent.changeText(userIdInput, 'testuser');
    fireEvent.changeText(passwordInput, 'testpass');

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        'ユーザーIDまたはパスワードが異なります'
      );
    });
  });

  it('displays correct input labels and placeholders', () => {
    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    expect(getByText('ユーザーID')).toBeTruthy();
    expect(getByText('パスワード')).toBeTruthy();
    expect(getByPlaceholderText('データ移行用ユーザーIDを入力')).toBeTruthy();
    expect(getByPlaceholderText('データ移行用パスワードを入力')).toBeTruthy();
  });

  it('has correct input properties', () => {
    const {getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('データ移行用ユーザーIDを入力');
    const passwordInput = getByPlaceholderText('データ移行用パスワードを入力');

    // Check autoCapitalize and autoCorrect properties
    expect(userIdInput.props.autoCapitalize).toBe('none');
    expect(userIdInput.props.autoCorrect).toBe(false);
    expect(passwordInput.props.autoCapitalize).toBe('none');
    expect(passwordInput.props.autoCorrect).toBe(false);
  });
});
