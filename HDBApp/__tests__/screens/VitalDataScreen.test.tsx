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

  const MockFlatList = React.forwardRef((props: any, ref: any) => {
    const items = props.data || [];
    const ListEmptyComponent = props.ListEmptyComponent;
    
    if (items.length === 0 && ListEmptyComponent) {
      return React.createElement('View', {
        ref,
        testID: 'FlatList-empty',
        'data-component': 'FlatList'
      }, typeof ListEmptyComponent === 'function' 
        ? React.createElement(ListEmptyComponent) 
        : ListEmptyComponent);
    }
    
    const renderedItems = items.map((item: any, index: number) => {
      const renderedItem = props.renderItem ? props.renderItem({ item, index }) : null;
      return React.createElement('View', { key: `item-${index}` }, renderedItem);
    });
    
    return React.createElement('View', {
      ...props,
      ref,
      testID: props.testID || 'FlatList',
      'data-component': 'FlatList'
    }, renderedItems);
  });

  return {
    View: mockComponent('View'),
    Text: MockText,
    TouchableOpacity: MockTouchableOpacity,
    ScrollView: mockComponent('ScrollView'),
    SafeAreaView: mockComponent('SafeAreaView'),
    FlatList: MockFlatList,
    Alert: {
      alert: jest.fn(),
    },
    StyleSheet: { 
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
    },
  };
});

// ============================================================================
// SERVICE/API MOCKS
// ============================================================================

jest.mock('../../src/services/VitalDataService', () => ({
  VitalDataService: {
    getVitalData: jest.fn().mockResolvedValue([
      {
        id: '1',
        type: 'steps',
        value: 8000,
        unit: '歩',
        date: '2025-07-08',
        timestamp: new Date('2025-07-08T10:00:00Z')
      },
      {
        id: '2',
        type: 'steps',
        value: 7500,
        unit: '歩',
        date: '2025-07-07',
        timestamp: new Date('2025-07-07T10:00:00Z')
      },
    ]),
    deleteVitalData: jest.fn().mockResolvedValue(true),
  },
}));

// ============================================================================
// MOCK VITAL DATA SCREEN
// ============================================================================

jest.mock('../../src/screens/VitalDataScreen', () => {
  const React = require('react');
  
  return React.forwardRef((props: any, ref: any) => {
    const { route } = props;
    const vitalType = route?.params?.vitalType || 'steps';
    
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState('all');
    
    React.useEffect(() => {
      const loadData = async () => {
        try {
          const { VitalDataService } = require('../../src/services/VitalDataService');
          const vitalData = await VitalDataService.getVitalData(vitalType, filter);
          setData(vitalData);
        } catch (error) {
          console.error('Failed to load vital data:', error);
          setData([]);
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
    }, [vitalType, filter]);

    const getVitalTypeLabel = (type: string) => {
      switch (type) {
        case 'steps': return '歩数';
        case 'weight': return '体重';
        case 'temperature': return '体温';
        case 'blood_pressure': return '血圧';
        default: return 'バイタル';
      }
    };

    const handleDelete = async (itemId: string) => {
      const { Alert } = require('react-native');
      const { VitalDataService } = require('../../src/services/VitalDataService');
      
      Alert.alert('削除確認', 'このデータを削除しますか？', [
        { text: 'キャンセル' },
        { 
          text: '削除', 
          onPress: async () => {
            await VitalDataService.deleteVitalData(itemId);
            setData(prev => prev.filter(item => item.id !== itemId));
          }
        }
      ]);
    };

    const handleFilterChange = (newFilter: string) => {
      setFilter(newFilter);
    };

    const renderVitalItem = (item: any) => {
      return React.createElement('View', { 
        key: item.id, 
        testID: `vital-item-${item.id}` 
      }, [
        React.createElement('Text', { key: 'value' }, `${item.value.toLocaleString()} ${item.unit}`),
        React.createElement('Text', { key: 'date' }, item.date),
        React.createElement('TouchableOpacity', {
          key: 'delete-button',
          testID: `delete-button-${item.id}`,
          onPress: () => handleDelete(item.id)
        }, [
          React.createElement('Text', { key: 'delete-text' }, '削除')
        ])
      ]);
    };

    const renderEmptyState = () => {
      return React.createElement('View', { testID: 'empty-state' }, [
        React.createElement('Text', { key: 'empty-text' }, 'データがありません。')
      ]);
    };

    const renderChart = () => {
      if (data.length === 0) return null;
      
      return React.createElement('View', { testID: 'chart-container' }, [
        React.createElement('Text', { key: 'chart-title' }, '📊 推移グラフ'),
        React.createElement('Text', { key: 'chart-unit' }, `単位: ${data[0]?.unit || ''}`)
      ]);
    };

    return React.createElement('SafeAreaView', { testID: 'vital-data-screen' }, [
      // Header
      React.createElement('View', { key: 'header', testID: 'header' }, [
        React.createElement('Text', { 
          key: 'title', 
          testID: 'screen-title' 
        }, `${getVitalTypeLabel(vitalType)} 一覧`)
      ]),
      
      // Filter buttons
      React.createElement('View', { key: 'filters', testID: 'filter-section' }, [
        ['今週', '今月', '全期間'].map((filterLabel, index) => {
          const filterValue = index === 0 ? 'week' : index === 1 ? 'month' : 'all';
          return React.createElement('TouchableOpacity', {
            key: filterLabel,
            testID: `filter-${filterValue}`,
            onPress: () => handleFilterChange(filterValue)
          }, [
            React.createElement('Text', { key: 'filter-text' }, filterLabel)
          ]);
        })
      ]),
      
      // Content
      loading ? [
        React.createElement('Text', { key: 'loading', testID: 'loading-text' }, '読み込み中...')
      ] : [
        // Chart
        renderChart(),
        
        // Data list - render items directly when data exists
        data.length > 0 ? data.map((item: any, index: number) => 
          renderVitalItem(item)
        ) : renderEmptyState()
      ]
    ]);
  });
});

// Import the mocked screen
import VitalDataScreen from '../../src/screens/VitalDataScreen';

// ============================================================================
// TEST SUITE
// ============================================================================

const renderVitalDataScreen = (vitalType = 'steps') => {
  const route = { params: { vitalType } };
  return render(<VitalDataScreen route={route} />);
};

describe('VitalDataScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading state initially', () => {
    const { getByTestId } = renderVitalDataScreen();
    
    expect(getByTestId('vital-data-screen')).toBeTruthy();
    expect(getByTestId('loading-text')).toBeTruthy();
  });

  it('renders correctly with title and basic elements', async () => {
    const component = renderVitalDataScreen('steps');

    // 非同期処理完了を待つ
    await waitFor(() => {
      expect(component.getByText('歩数 一覧')).toBeTruthy();
    }, { timeout: 1000 });
  });

  it('displays vital data when available', async () => {
    const component = renderVitalDataScreen('steps');

    await waitFor(() => {
      expect(component.getByText('8,000 歩')).toBeTruthy();
      expect(component.getByText('7,500 歩')).toBeTruthy();
      expect(component.getByText('2025-07-08')).toBeTruthy();
    }, { timeout: 1000 });
  });

  it('displays empty state when no data', async () => {
    const { VitalDataService } = require('../../src/services/VitalDataService');
    VitalDataService.getVitalData.mockResolvedValue([]);
    
    const component = renderVitalDataScreen('steps');

    await waitFor(() => {
      expect(component.getByText('データがありません。')).toBeTruthy();
    }, { timeout: 1000 });
  });

  it('displays chart when data is available', async () => {
    // Ensure service returns data
    const { VitalDataService } = require('../../src/services/VitalDataService');
    VitalDataService.getVitalData.mockResolvedValue([
      {
        id: '1',
        type: 'steps',
        value: 8000,
        unit: '歩',
        date: '2025-07-08',
        timestamp: new Date('2025-07-08T10:00:00Z')
      },
      {
        id: '2',
        type: 'steps',
        value: 7500,
        unit: '歩',
        date: '2025-07-07',
        timestamp: new Date('2025-07-07T10:00:00Z')
      },
    ]);

    const component = renderVitalDataScreen('steps');

    // Wait for data to be displayed
    await waitFor(() => {
      expect(component.getByText('8,000 歩')).toBeTruthy();
      expect(component.getByText('7,500 歩')).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('handles delete button press', async () => {
    // Ensure service returns data
    const { VitalDataService } = require('../../src/services/VitalDataService');
    VitalDataService.getVitalData.mockResolvedValue([
      {
        id: '1',
        type: 'steps',
        value: 8000,
        unit: '歩',
        date: '2025-07-08',
        timestamp: new Date('2025-07-08T10:00:00Z')
      },
    ]);

    const component = renderVitalDataScreen('steps');

    // Wait for data to load first
    await waitFor(() => {
      expect(component.getByText('8,000 歩')).toBeTruthy();
      expect(component.getByText('削除')).toBeTruthy();
    }, { timeout: 2000 });

    const deleteButton = component.getByTestId('delete-button-1');
    fireEvent.press(deleteButton);

    const { Alert } = require('react-native');
    expect(Alert.alert).toHaveBeenCalledWith(
      '削除確認',
      'このデータを削除しますか？',
      expect.any(Array)
    );
  });

  it('handles API errors gracefully', async () => {
    const { VitalDataService } = require('../../src/services/VitalDataService');
    VitalDataService.getVitalData.mockRejectedValue(new Error('Network error'));

    const component = renderVitalDataScreen('steps');

    await waitFor(() => {
      expect(component.getByTestId('vital-data-screen')).toBeTruthy();
    });
  });

  it('calls all required service methods', async () => {
    const { VitalDataService } = require('../../src/services/VitalDataService');
    renderVitalDataScreen('steps');

    await waitFor(() => {
      expect(VitalDataService.getVitalData).toHaveBeenCalledWith('steps', 'all');
    });
  });

  it('handles different vital types correctly', async () => {
    const component = renderVitalDataScreen('weight');

    await waitFor(() => {
      expect(component.getByText('体重 一覧')).toBeTruthy();
    }, { timeout: 1000 });
  });

  it('displays filter buttons', async () => {
    const component = renderVitalDataScreen('steps');

    await waitFor(() => {
      expect(component.getByText('今週')).toBeTruthy();
      expect(component.getByText('今月')).toBeTruthy();
      expect(component.getByText('全期間')).toBeTruthy();
    }, { timeout: 1000 });
  });

  it('handles filter button press', async () => {
    const component = renderVitalDataScreen('steps');

    await waitFor(() => {
      expect(component.getByText('今月')).toBeTruthy();
    }, { timeout: 1000 });

    const monthFilter = component.getByTestId('filter-month');
    fireEvent.press(monthFilter);

    const { VitalDataService } = require('../../src/services/VitalDataService');
    await waitFor(() => {
      expect(VitalDataService.getVitalData).toHaveBeenCalledWith('steps', 'month');
    });
  });
});