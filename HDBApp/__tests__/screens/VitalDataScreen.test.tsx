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
      onPress: props.onPress
    }, props.children);
  });

  // Special FlatList that renders items
  const MockFlatList = React.forwardRef((props: any, ref: any) => {
    const items = props.data || [];
    const ListEmptyComponent = props.ListEmptyComponent;
    
    if (items.length === 0 && ListEmptyComponent) {
      return React.createElement('View', {
        ref,
        testID: 'FlatList-empty',
        'data-component': 'FlatList'
      }, React.createElement(ListEmptyComponent));
    }
    
    return React.createElement('View', {
      ...props,
      ref,
      testID: 'FlatList',
      'data-component': 'FlatList'
    }, items.map((item: any, index: number) => 
      React.createElement('View', {
        key: props.keyExtractor ? props.keyExtractor(item) : index,
        testID: `FlatList-item-${index}`
      }, props.renderItem ? props.renderItem({item, index}) : null)
    ));
  });

  return {
    // Basic components
    View: mockComponent('View'),
    Text: MockText,
    TouchableOpacity: MockTouchableOpacity,
    FlatList: MockFlatList,
    
    // Alert
    Alert: {
      alert: jest.fn(),
    },
    
    // StyleSheet
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
    },
  };
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: { title: '歩数' },
  }),
}));

jest.mock('@react-navigation/stack', () => ({
  StackNavigationProp: {},
}));

// Mock AppNavigator types
jest.mock('../../src/navigation/AppNavigator', () => ({
  RootStackParamList: {},
}));

// Mock VitalInputDialog
jest.mock('../../src/components/VitalInputDialog', () => {
  const React = require('react');
  return React.forwardRef((props: any, ref: any) => {
    if (!props.visible) return null;
    return React.createElement('View', {
      ref,
      testID: 'VitalInputDialog',
      'data-component': 'VitalInputDialog'
    }, [
      React.createElement('Text', { key: 'title' }, `編集: ${props.title}`),
      React.createElement('Text', { key: 'value' }, `初期値: ${props.initialValue}`)
    ]);
  });
});

// Mock VitalDataService with immediate resolution
const mockVitalDataService = {
  initializeService: jest.fn(() => Promise.resolve()),
  getVitalDataByType: jest.fn(() => Promise.resolve([])),
  getVitalDataByPeriod: jest.fn(() => Promise.resolve([])),
  calculateAchievementRate: jest.fn(() => Promise.resolve(80)),
  convertToLegacyFormat: jest.fn(() => [] as any[]),
  insertDummyData: jest.fn(() => Promise.resolve()),
  updateVitalData: jest.fn(() => Promise.resolve()),
  deleteVitalData: jest.fn(() => Promise.resolve()),
};

jest.mock('../../src/services/VitalDataService', () => ({
  VitalDataService: jest.fn(() => mockVitalDataService),
}));

// Mock DatabaseService types
jest.mock('../../src/services/DatabaseService', () => ({
  VitalDataRecord: {},
}));

// Import VitalDataScreen after all mocks are set up
import VitalDataScreen from '../../src/screens/VitalDataScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockSetOptions = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  setOptions: mockSetOptions,
  canGoBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  getId: jest.fn(),
  setParams: jest.fn(),
};

const mockRoute = {
  params: {
    title: '歩数',
  },
  key: 'test-key',
  name: 'VitalData' as const,
};

describe('VitalDataScreen', () => {
  let component: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset all mocks to default behavior
    mockVitalDataService.initializeService.mockResolvedValue(undefined);
    mockVitalDataService.getVitalDataByType.mockResolvedValue([]);
    mockVitalDataService.getVitalDataByPeriod.mockResolvedValue([]);
    mockVitalDataService.calculateAchievementRate.mockResolvedValue(80);
    mockVitalDataService.convertToLegacyFormat.mockReturnValue([]);
    mockVitalDataService.insertDummyData.mockResolvedValue(undefined);
    mockVitalDataService.updateVitalData.mockResolvedValue(undefined);
    mockVitalDataService.deleteVitalData.mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (component && component.unmount) {
      component.unmount();
    }
  });

  it('displays loading state initially', () => {
    // 非同期処理を遅延させる
    mockVitalDataService.initializeService.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    component = render(
      <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
    );

    expect(component.getByText('データを読み込み中...')).toBeTruthy();
  });

  it('renders correctly with title and basic elements', async () => {
    component = render(
      <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
    );

    // 非同期処理完了を待つ
    await waitFor(() => {
      expect(component.getByText('歩数 一覧')).toBeTruthy();
    }, { timeout: 1000 });

    expect(component.getByText('目標達成率')).toBeTruthy();
    expect(component.getByText('80.0 %')).toBeTruthy();
  });

  it('displays vital data when available', async () => {
    const mockData = [
      { id: '1', date: '2025-07-08', value: '8,000 歩' },
      { id: '2', date: '2025-07-07', value: '7,500 歩' },
    ];

    mockVitalDataService.convertToLegacyFormat.mockReturnValue(mockData);

    component = render(
      <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(component.getByText('8,000 歩')).toBeTruthy();
      expect(component.getByText('7,500 歩')).toBeTruthy();
      expect(component.getByText('2025-07-08')).toBeTruthy();
      expect(component.getByText('2025-07-07')).toBeTruthy();
    }, { timeout: 1000 });
  });

  it('displays empty state when no data', async () => {
    mockVitalDataService.convertToLegacyFormat.mockReturnValue([]);

    component = render(
      <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(component.getByText('データがありません。')).toBeTruthy();
    }, { timeout: 1000 });
  });

  it('displays chart when data is available', async () => {
    const mockData = [
      { id: '1', date: '2025-07-08', value: '8,000 歩' },
      { id: '2', date: '2025-07-07', value: '7,500 歩' },
    ];

    mockVitalDataService.convertToLegacyFormat.mockReturnValue(mockData);

    component = render(
      <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(component.getByText('📊 推移グラフ')).toBeTruthy();
      expect(component.getByText('単位: 歩')).toBeTruthy();
    }, { timeout: 1000 });
  });

  it('handles delete button press', async () => {
    const mockData = [
      { id: '1', date: '2025-07-08', value: '8,000 歩' },
    ];

    mockVitalDataService.convertToLegacyFormat.mockReturnValue(mockData);

    component = render(
      <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(component.getByText('削除')).toBeTruthy();
    }, { timeout: 1000 });

    // 削除ボタンをタップ
    fireEvent.press(component.getByText('削除'));

    // Alert.alertが呼ばれることを確認
    expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
      '削除',
      'この項目を削除しますか？',
      expect.any(Array)
    );
  });

  it('handles API errors gracefully', async () => {
    mockVitalDataService.initializeService.mockRejectedValue(new Error('Database error'));

    component = render(
      <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
        'エラー',
        'データの読み込みに失敗しました。'
      );
    }, { timeout: 1000 });
  });

  it('calls all required service methods', async () => {
    component = render(
      <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(mockVitalDataService.initializeService).toHaveBeenCalled();
      expect(mockVitalDataService.getVitalDataByType).toHaveBeenCalledWith('歩数');
      expect(mockVitalDataService.getVitalDataByPeriod).toHaveBeenCalledWith('歩数', 'week');
      expect(mockVitalDataService.calculateAchievementRate).toHaveBeenCalledWith('歩数');
      expect(mockVitalDataService.convertToLegacyFormat).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('handles different vital types correctly', async () => {
    const weightRoute = {
      ...mockRoute,
      params: { title: '体重' },
    };

    component = render(
      <VitalDataScreen route={weightRoute as any} navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(component.getByText('体重 一覧')).toBeTruthy();
    }, { timeout: 1000 });
  });

  it('displays filter buttons', async () => {
    component = render(
      <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(component.getByText('今週')).toBeTruthy();
      expect(component.getByText('今月')).toBeTruthy();
      expect(component.getByText('全期間')).toBeTruthy();
    }, { timeout: 1000 });
  });

  it('handles filter button press', async () => {
    component = render(
      <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(component.getByText('今月')).toBeTruthy();
    }, { timeout: 1000 });

    // 今月ボタンをタップ
    fireEvent.press(component.getByText('今月'));

    await waitFor(() => {
      expect(mockVitalDataService.getVitalDataByPeriod).toHaveBeenCalledWith('歩数', 'month');
    }, { timeout: 1000 });
  });
});
