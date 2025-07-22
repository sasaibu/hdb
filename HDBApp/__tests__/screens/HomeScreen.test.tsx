import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {TouchableOpacity} from 'react-native';

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
    ScrollView: mockComponent('ScrollView'),
    TouchableOpacity: mockComponent('TouchableOpacity'),
    TouchableHighlight: mockComponent('TouchableHighlight'),
    Pressable: mockComponent('Pressable'),
    Image: mockComponent('Image'),
    TextInput: mockComponent('TextInput'),
    Switch: mockComponent('Switch'),
    Button: mockComponent('Button'),
    
    // List components
    FlatList: React.forwardRef((props: any, ref: any) => {
      const { data = [], renderItem, keyExtractor } = props;
      return React.createElement('View', {
        ref,
        testID: props.testID || 'FlatList',
        'data-component': 'FlatList',
        children: data.map((item: any, index: number) => {
          const key = keyExtractor ? keyExtractor(item, index) : index;
          return renderItem ? renderItem({ item, index }) : null;
        })
      });
    }),
    
    SectionList: mockComponent('SectionList'),
    VirtualizedList: mockComponent('VirtualizedList'),
    
    // RefreshControl
    RefreshControl: mockComponent('RefreshControl'),
    
    // Activity Indicator
    ActivityIndicator: mockComponent('ActivityIndicator'),
    
    // Layout components
    SafeAreaView: mockComponent('SafeAreaView'),
    KeyboardAvoidingView: mockComponent('KeyboardAvoidingView'),
    
    // Modal
    Modal: mockComponent('Modal'),
    
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
    
    // AppState
    AppState: {
      currentState: 'active',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    
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
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        interpolate: jest.fn(() => ({ setValue: jest.fn() })),
      })),
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

// Mock React Navigation
jest.mock('@react-navigation/drawer', () => ({
  DrawerNavigationProp: {},
}));

jest.mock('@react-navigation/native', () => ({
  CompositeNavigationProp: {},
}));

jest.mock('@react-navigation/stack', () => ({
  StackNavigationProp: {},
}));

// Mock AppNavigator types
jest.mock('../../src/navigation/AppNavigator', () => ({
  MainDrawerParamList: {},
  RootStackParamList: {},
}));

// Mock apiClient
jest.mock('../../src/services/api/apiClient', () => ({
  apiClient: {
    getRankings: jest.fn().mockResolvedValue({
      success: true,
      data: [
        {rank: 1, displayName: '田中 太郎', steps: 12345},
        {rank: 2, displayName: '鈴木 花子', steps: 11234},
        {rank: 3, displayName: '佐藤 次郎', steps: 10123},
        {rank: 4, displayName: '伊藤 三郎', steps: 9876},
        {rank: 5, displayName: '渡辺 久美子', steps: 8765},
      ],
    }),
    getVitalSummary: jest.fn().mockResolvedValue({
      success: true,
      data: {
        steps: {today: 8456},
        weight: {latest: 65.2},
        temperature: {latest: 36.5},
        bloodPressure: {latestSystolic: 120, latestDiastolic: 80},
      },
    }),
  },
}));

// Import HomeScreen after all mocks are set up
import HomeScreen from '../../src/screens/HomeScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  openDrawer: jest.fn(),
  closeDrawer: jest.fn(),
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

const renderHomeScreen = () => {
  return render(<HomeScreen navigation={mockNavigation as any} />);
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const {getByText} = renderHomeScreen();
    
    expect(getByText('おかえりなさい')).toBeTruthy();
    expect(getByText(/\d{4}\/\d{1,2}\/\d{1,2}/)).toBeTruthy(); // 日付表示
  });

  it('displays dashboard cards with correct values', async () => {
    const {getByText} = renderHomeScreen();
    
    // バイタルデータカードの確認
    expect(getByText('歩数')).toBeTruthy();
    expect(getByText('体重')).toBeTruthy();
    expect(getByText('体温')).toBeTruthy();
    expect(getByText('血圧')).toBeTruthy();
    
    // APIデータの読み込みを待つ
    await waitFor(() => {
      expect(getByText('8,456')).toBeTruthy();
      expect(getByText('65.2')).toBeTruthy();
      expect(getByText('36.5')).toBeTruthy();
      expect(getByText('120/80')).toBeTruthy();
    }, {timeout: 3000});
  });

  it('navigates to VitalData screen when card is pressed', () => {
    const {UNSAFE_getAllByType} = renderHomeScreen();
    
    // TouchableOpacityコンポーネントを取得
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // 最初のカード（歩数カード）をタップ
    fireEvent.press(buttons[0]);
    
    expect(mockNavigate).toHaveBeenCalledWith('VitalData', {title: '歩数'});
  });

  it('displays ranking section', async () => {
    const {getByText} = renderHomeScreen();
    
    expect(getByText('歩数ランキング')).toBeTruthy();
    
    // ランキングデータの表示を待つ
    await waitFor(() => {
      expect(getByText('田中 太郎')).toBeTruthy();
      expect(getByText('12,345 歩')).toBeTruthy();
    }, {timeout: 3000});
  });

  it('displays notification section', () => {
    const {getByText} = renderHomeScreen();
    
    expect(getByText('お知らせ')).toBeTruthy();
    expect(getByText('システムメンテナンス')).toBeTruthy();
    expect(getByText(/本日23:00〜翌1:00の間/)).toBeTruthy();
  });

  it('navigates to WebView when quick action is pressed', () => {
    const {getByText} = renderHomeScreen();
    
    const quickActionButton = getByText('Yahoo! を開く');
    fireEvent.press(quickActionButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('WebView', {
      url: 'https://yahoo.co.jp',
      title: 'Yahoo! JAPAN',
    });
  });

  it('displays all ranking items after loading', async () => {
    const {getByText, getAllByText} = renderHomeScreen();
    
    await waitFor(() => {
      // 5人分のランキングデータが表示されることを確認
      expect(getByText('田中 太郎')).toBeTruthy();
      expect(getByText('鈴木 花子')).toBeTruthy();
      expect(getByText('佐藤 次郎')).toBeTruthy();
      expect(getByText('伊藤 三郎')).toBeTruthy();
      expect(getByText('渡辺 久美子')).toBeTruthy();
      
      // 歩数の表示を確認
      const stepTexts = getAllByText(/\d+,\d+ 歩/);
      expect(stepTexts).toHaveLength(5);
    }, {timeout: 3000});
  });
});
