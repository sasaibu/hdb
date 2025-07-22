import React from 'react';
import {render, waitFor} from '@testing-library/react-native';

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

  return {
    // Basic components
    View: mockComponent('View'),
    Text: MockText,
    ActivityIndicator: React.forwardRef((props: any, ref: any) => {
      return React.createElement('View', {
        ...props,
        ref,
        testID: props.testID || 'loading-indicator',
        'data-component': 'ActivityIndicator'
      });
    }),
    
    // StyleSheet
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
    },
  };
});

// Mock React Navigation
jest.mock('@react-navigation/stack', () => ({
  StackNavigationProp: {},
}));

// Mock AppNavigator types
jest.mock('../../src/navigation/AppNavigator', () => ({
  RootStackParamList: {},
}));

// Mock mockApi
jest.mock('../../src/services/api/mockApi', () => ({
  mockApi: {
    initializeDevice: jest.fn(),
    getInitialData: jest.fn(),
    verifyToken: jest.fn(),
  },
}));

// Import SplashScreen after all mocks are set up
import SplashScreen from '../../src/screens/SplashScreen';
import {mockApi} from '../../src/services/api/mockApi';

// Mock navigation
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  replace: mockReplace,
  goBack: jest.fn(),
  canGoBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  getId: jest.fn(),
  setOptions: jest.fn(),
  setParams: jest.fn(),
};

describe('SplashScreen', () => {
  const mockInitializeDevice = mockApi.initializeDevice as jest.Mock;
  const mockGetInitialData = mockApi.getInitialData as jest.Mock;
  const mockVerifyToken = mockApi.verifyToken as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // デフォルトのモック設定
    mockInitializeDevice.mockResolvedValue({
      success: true,
      data: { deviceId: 'device-123' },
    });
    
    mockGetInitialData.mockResolvedValue({
      success: true,
      data: { 
        appSettings: { theme: 'light' },
        isFirstLaunch: false,
      },
    });
    
    mockVerifyToken.mockResolvedValue({
      success: false,
      error: 'Unauthorized',
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders correctly with logo and app name', () => {
    const {getByText} = render(<SplashScreen navigation={mockNavigation as any} />);
    
    expect(getByText('HDB')).toBeTruthy();
    expect(getByText('Health Data Bank')).toBeTruthy();
    expect(getByText('初期化中...')).toBeTruthy();
  });

  it('displays loading indicator', () => {
    const {getByTestId} = render(<SplashScreen navigation={mockNavigation as any} />);
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('navigates to Login screen when user is not authenticated', async () => {
    mockVerifyToken.mockResolvedValue({
      success: false,
      error: 'Unauthorized',
    });

    render(<SplashScreen navigation={mockNavigation as any} />);

    // 2秒後にAPI処理開始
    jest.advanceTimersByTime(2000);
    
    await waitFor(() => {
      expect(mockInitializeDevice).toHaveBeenCalled();
      expect(mockGetInitialData).toHaveBeenCalled();
      expect(mockVerifyToken).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('Login');
    });
  });

  it('navigates to Main screen when user is authenticated', async () => {
    mockVerifyToken.mockResolvedValue({
      success: true,
      data: {
        isValid: true,
        user: { id: 'user-123' },
      },
    });

    render(<SplashScreen navigation={mockNavigation as any} />);

    // 2秒後にAPI処理開始
    jest.advanceTimersByTime(2000);
    
    await waitFor(() => {
      expect(mockInitializeDevice).toHaveBeenCalled();
      expect(mockGetInitialData).toHaveBeenCalled();
      expect(mockVerifyToken).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('Main');
    });
  });

  it('displays status messages during initialization', async () => {
    const {getByText} = render(<SplashScreen navigation={mockNavigation as any} />);
    
    // 初期状態
    expect(getByText('初期化中...')).toBeTruthy();
    
    // 2秒後にAPI処理開始
    jest.advanceTimersByTime(2000);
    
    // API処理が非常に高速なので、最終的な状態メッセージを確認
    await waitFor(() => {
      expect(getByText('認証状態を確認しています...')).toBeTruthy();
    });
  });

  it('handles API errors gracefully', async () => {
    mockInitializeDevice.mockRejectedValue(new Error('Network error'));

    render(<SplashScreen navigation={mockNavigation as any} />);

    // 2秒後にAPI処理開始
    jest.advanceTimersByTime(2000);
    
    await waitFor(() => {
      expect(mockInitializeDevice).toHaveBeenCalled();
    });

    // エラー時はLogin画面にフォールバック
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('Login');
    });
  });

  it('calls all required APIs in correct order', async () => {
    render(<SplashScreen navigation={mockNavigation as any} />);

    // 2秒後にAPI処理開始
    jest.advanceTimersByTime(2000);
    
    await waitFor(() => {
      expect(mockInitializeDevice).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockGetInitialData).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockVerifyToken).toHaveBeenCalled();
    });

    // API呼び出し順序の確認
    const calls = [
      mockInitializeDevice.mock.invocationCallOrder[0],
      mockGetInitialData.mock.invocationCallOrder[0],
      mockVerifyToken.mock.invocationCallOrder[0],
    ];
    
    expect(calls[0]).toBeLessThan(calls[1]);
    expect(calls[1]).toBeLessThan(calls[2]);
  });

  it('waits minimum 2 seconds before starting initialization', async () => {
    render(<SplashScreen navigation={mockNavigation as any} />);

    // 1.5秒後はまだAPI呼び出しされていない
    jest.advanceTimersByTime(1500);
    expect(mockInitializeDevice).not.toHaveBeenCalled();

    // 2秒後にAPI呼び出し開始
    jest.advanceTimersByTime(500);
    
    await waitFor(() => {
      expect(mockInitializeDevice).toHaveBeenCalled();
    });
  });

  it('clears timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    const {unmount} = render(<SplashScreen navigation={mockNavigation as any} />);
    
    unmount();
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });
});
