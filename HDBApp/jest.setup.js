import 'react-native-gesture-handler/jestSetup';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock react-navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      replace: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useFocusEffect: jest.fn(),
  };
});

// Mock SafeAreaProvider
jest.mock('react-native-safe-area-context', () => {
  const inset = {top: 0, right: 0, bottom: 0, left: 0};
  return {
    SafeAreaProvider: ({children}) => children,
    SafeAreaConsumer: ({children}) => children(inset),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({x: 0, y: 0, width: 390, height: 844}),
  };
});

// Mock WebView
jest.mock('react-native-webview', () => {
  const React = require('react');
  return {
    WebView: React.forwardRef((props, ref) => {
      const MockWebView = require('react-native').View;
      React.useEffect(() => {
        if (props.onLoadStart) {
          props.onLoadStart({nativeEvent: {url: props.source?.uri || 'https://example.com'}});
        }
        setTimeout(() => {
          if (props.onLoadEnd) {
            props.onLoadEnd({nativeEvent: {url: props.source?.uri || 'https://example.com'}});
          }
        }, 100);
      }, []);
      return React.createElement(MockWebView, {ref, testID: props.testID});
    }),
  };
});

// Mock React Native components
jest.mock('react-native', () => {
  const React = require('react');
  const RN = jest.requireActual('react-native');
  
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
    RefreshControl: React.forwardRef((props, ref) => {
      return React.createElement('RefreshControl', {ref, ...props});
    }),
    FlatList: React.forwardRef((props, ref) => {
      return React.createElement('FlatList', {ref, ...props});
    }),
    ScrollView: React.forwardRef((props, ref) => {
      return React.createElement('ScrollView', {ref, ...props});
    }),
  };
});

// Silence console warnings during tests
const originalWarn = console.warn;
const originalError = console.error;

beforeEach(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Mock react-native-sqlite-2
jest.mock('react-native-sqlite-2', () => {
  return {
    openDatabase: jest.fn(() => ({
      transaction: jest.fn((callback) => {
        const mockTx = {
          executeSql: jest.fn((sql, params, successCallback) => {
            if (successCallback) {
              successCallback(mockTx, { insertId: 1, rows: { length: 0, item: () => ({}) } });
            }
          }),
        };
        callback(mockTx);
      }),
    })),
  };
});

// Global test timeout
jest.setTimeout(10000);
