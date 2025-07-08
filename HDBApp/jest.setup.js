import 'react-native-gesture-handler/jestSetup';

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
