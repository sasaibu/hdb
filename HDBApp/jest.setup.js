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
    NavigationContainer: ({ children }) => children,
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

// Mock stack navigator
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: () => null,
  }),
}));

// Mock drawer navigator
jest.mock('@react-navigation/drawer', () => ({
  createDrawerNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: () => null,
  }),
}));

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
  
  // Create mock components that don't require actual React Native
  const mockComponent = (name) => React.forwardRef((props, ref) => {
    const { children, ...restProps } = props;
    return React.createElement('View', {
      ...restProps,
      ref,
      testID: props.testID || name,
      'data-component': name
    }, children);
  });

  // Special handling for Text component to render children
  const TextComponent = React.forwardRef((props, ref) => {
    const { children, ...restProps } = props;
    return React.createElement('Text', {
      ...restProps,
      ref,
      testID: props.testID || 'Text',
      'data-component': 'Text'
    }, children);
  });

  // Special handling for TextInput to support placeholder
  const TextInputComponent = React.forwardRef((props, ref) => {
    const { children, ...restProps } = props;
    return React.createElement('TextInput', {
      ...restProps,
      ref,
      testID: props.testID || 'TextInput',
      'data-component': 'TextInput'
    }, children);
  });

  // ActivityIndicator component
  const ActivityIndicator = React.forwardRef((props, ref) => {
    return React.createElement('ActivityIndicator', {
      ...props,
      ref,
      testID: props.testID || 'ActivityIndicator',
      'data-component': 'ActivityIndicator'
    });
  });

  return {
    // Basic components
    View: mockComponent('View'),
    Text: TextComponent,
    ScrollView: mockComponent('ScrollView'),
    TouchableOpacity: mockComponent('TouchableOpacity'),
    TouchableHighlight: mockComponent('TouchableHighlight'),
    Pressable: mockComponent('Pressable'),
    Image: mockComponent('Image'),
    TextInput: TextInputComponent,
    Switch: mockComponent('Switch'),
    Button: mockComponent('Button'),
    ActivityIndicator: ActivityIndicator,
    
    // List components
    FlatList: React.forwardRef((props, ref) => {
      const { data = [], renderItem, keyExtractor } = props;
      return React.createElement('View', {
        ref,
        testID: props.testID || 'FlatList',
        'data-component': 'FlatList',
        children: data.map((item, index) => {
          const key = keyExtractor ? keyExtractor(item, index) : index;
          return renderItem ? renderItem({ item, index }) : null;
        })
      });
    }),
    
    SectionList: mockComponent('SectionList'),
    VirtualizedList: mockComponent('VirtualizedList'),
    
    // RefreshControl - the main problem component
    RefreshControl: React.forwardRef((props, ref) => {
      return React.createElement('View', {
        ref,
        testID: props.testID || 'RefreshControl',
        'data-component': 'RefreshControl',
        'data-refreshing': props.refreshing || false
      });
    }),
    
    // Layout components
    SafeAreaView: mockComponent('SafeAreaView'),
    KeyboardAvoidingView: mockComponent('KeyboardAvoidingView'),
    
    // Modal and overlay
    Modal: React.forwardRef((props, ref) => {
      const { visible = true, children, ...restProps } = props;
      if (!visible) return null;
      return React.createElement('Modal', {
        ...restProps,
        ref,
        testID: props.testID || 'Modal',
        'data-component': 'Modal'
      }, children);
    }),
    
    // Platform and device info
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
    },
    
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    
    // Alert
    Alert: {
      alert: jest.fn(),
      prompt: jest.fn(),
    },
    
    // Linking
    Linking: {
      openURL: jest.fn(() => Promise.resolve()),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
      getInitialURL: jest.fn(() => Promise.resolve(null)),
    },
    
    // NativeModules
    NativeModules: {
      NotificationModule: {
        showNotification: jest.fn(),
        cancelNotification: jest.fn(),
        cancelAllNotifications: jest.fn(),
      },
    },
    
    // AppState
    AppState: {
      currentState: 'active',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    
    // Color scheme hook
    useColorScheme: jest.fn(() => 'light'),
    
    // StyleSheet
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
    },
    
    // Animated
    Animated: {
      View: mockComponent('AnimatedView'),
      Text: mockComponent('AnimatedText'),
      ScrollView: mockComponent('AnimatedScrollView'),
      Value: function AnimatedValue(initialValue) {
        this._value = initialValue;
        this.setValue = jest.fn();
        this.addListener = jest.fn();
        this.removeListener = jest.fn();
        this.interpolate = jest.fn(() => ({
          setValue: jest.fn(),
          addListener: jest.fn(),
          removeListener: jest.fn(),
          _value: initialValue,
        }));
        return this;
      },
      timing: jest.fn(() => ({ start: jest.fn() })),
      spring: jest.fn(() => ({ start: jest.fn() })),
      decay: jest.fn(() => ({ start: jest.fn() })),
      sequence: jest.fn(() => ({ start: jest.fn() })),
      parallel: jest.fn(() => ({ start: jest.fn() })),
      stagger: jest.fn(() => ({ start: jest.fn() })),
      loop: jest.fn(() => ({ start: jest.fn() })),
    },
    
    // PanResponder
    PanResponder: {
      create: jest.fn(() => ({
        panHandlers: {},
      })),
    },
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

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  return {
    GestureHandlerRootView: React.forwardRef((props, ref) => {
      const {View} = require('react-native');
      return React.createElement(View, {...props, ref});
    }),
    PanGestureHandler: React.forwardRef((props, ref) => {
      const {View} = require('react-native');  
      return React.createElement(View, {...props, ref});
    }),
    TapGestureHandler: React.forwardRef((props, ref) => {
      const {View} = require('react-native');
      return React.createElement(View, {...props, ref});
    }),
    FlingGestureHandler: React.forwardRef((props, ref) => {
      const {View} = require('react-native');
      return React.createElement(View, {...props, ref});
    }),
    State: {
      BEGAN: 'BEGAN',
      FAILED: 'FAILED',
      CANCELLED: 'CANCELLED',
      ACTIVE: 'ACTIVE',
      END: 'END',
    },
    Directions: {
      UP: 'UP',
      DOWN: 'DOWN',
      LEFT: 'LEFT',
      RIGHT: 'RIGHT',
    }
  };
});

// Mock react-native-keychain
jest.doMock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  getGenericPassword: jest.fn(() => Promise.resolve({ username: 'test', password: 'test' })),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
  hasInternetCredentials: jest.fn(() => Promise.resolve(false)),
  setInternetCredentials: jest.fn(() => Promise.resolve()),
  getInternetCredentials: jest.fn(() => Promise.resolve(false)),
  resetInternetCredentials: jest.fn(() => Promise.resolve()),
  requestSharedWebCredentials: jest.fn(() => Promise.resolve(null)),
  setSharedWebCredentials: jest.fn(() => Promise.resolve()),
}), {virtual: true});

// Mock react-native-svg
jest.doMock('react-native-svg', () => {
  const React = require('react');
  const mockComponent = (name) => React.forwardRef((props, ref) => 
    React.createElement('View', { ...props, ref, testID: props.testID || name })
  );
  
  return {
    __esModule: true,
    default: mockComponent('Svg'),
    Svg: mockComponent('Svg'),
    Circle: mockComponent('Circle'),
    Ellipse: mockComponent('Ellipse'),
    G: mockComponent('G'),
    Text: mockComponent('SvgText'),
    TSpan: mockComponent('TSpan'),
    TextPath: mockComponent('TextPath'),
    Path: mockComponent('Path'),
    Polygon: mockComponent('Polygon'),
    Polyline: mockComponent('Polyline'),
    Line: mockComponent('Line'),
    Rect: mockComponent('Rect'),
    Use: mockComponent('Use'),
    Image: mockComponent('SvgImage'),
    Symbol: mockComponent('Symbol'),
    Defs: mockComponent('Defs'),
    LinearGradient: mockComponent('LinearGradient'),
    RadialGradient: mockComponent('RadialGradient'),
    Stop: mockComponent('Stop'),
    ClipPath: mockComponent('ClipPath'),
    Mask: mockComponent('Mask'),
    Pattern: mockComponent('Pattern'),
  };
}, { virtual: true });

// Mock react-native-fs
jest.doMock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  readFile: jest.fn(() => Promise.resolve('mock file content')),
  exists: jest.fn(() => Promise.resolve(true)),
  writeFile: jest.fn(() => Promise.resolve()),
  unlink: jest.fn(() => Promise.resolve()),
  mkdir: jest.fn(() => Promise.resolve()),
  readDir: jest.fn(() => Promise.resolve([])),
  stat: jest.fn(() => Promise.resolve({
    isFile: () => true,
    isDirectory: () => false,
    size: 1024,
    mtime: new Date(),
  })),
}), { virtual: true });

// Global test timeout
jest.setTimeout(10000);
