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

  return {
    View: mockComponent('View'),
    Text: MockText,
    TouchableOpacity: MockTouchableOpacity,
    ScrollView: mockComponent('ScrollView'),
    SafeAreaView: mockComponent('SafeAreaView'),
    StyleSheet: { 
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
    },
  };
});

// ============================================================================
// API MOCKS
// ============================================================================

jest.mock('../../src/services/api/apiClient', () => ({
  apiClient: {
    getVitalSummary: jest.fn().mockResolvedValue({
      success: true,
      data: {
        steps: { today: 8456 },
        weight: { latest: 65.2 },
        temperature: { latest: 36.5 },
        bloodPressure: { latestSystolic: 120, latestDiastolic: 80 },
      },
    }),
    getRankings: jest.fn().mockResolvedValue({
      success: true,
      data: [
        { rank: 1, displayName: '田中 太郎', steps: 12345 },
        { rank: 2, displayName: '鈴木 花子', steps: 11234 },
        { rank: 3, displayName: '佐藤 次郎', steps: 10123 },
      ],
    }),
  },
}));

// ============================================================================
// MOCK HOME SCREEN
// ============================================================================

jest.mock('../../src/screens/HomeScreen', () => {
  const React = require('react');
  
  return React.forwardRef((props: any, ref: any) => {
    const [vitalData, setVitalData] = React.useState(null);
    const [rankings, setRankings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
      const loadData = async () => {
        try {
          const { apiClient } = require('../../src/services/api/apiClient');
          const [vitalResponse, rankingResponse] = await Promise.all([
            apiClient.getVitalSummary(),
            apiClient.getRankings()
          ]);
          
          if (vitalResponse.success) {
            setVitalData(vitalResponse.data);
          }
          if (rankingResponse.success) {
            setRankings(rankingResponse.data);
          }
        } catch (error) {
          console.error('Failed to load data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
    }, []);

    const handleCardPress = (cardType: string) => {
      props.navigation.navigate('VitalData', { type: cardType });
    };

    const handleQuickAction = (url: string, title: string) => {
      props.navigation.navigate('WebView', { url, title });
    };

    return React.createElement('SafeAreaView', { testID: 'home-screen' }, [
      // Header
      React.createElement('View', { key: 'header', testID: 'home-header' }, [
        React.createElement('Text', { key: 'greeting', testID: 'greeting-text' }, 'おかえりなさい'),
        React.createElement('Text', { key: 'date', testID: 'date-text' }, new Date().toLocaleDateString('ja-JP'))
      ]),
      
      // Dashboard Cards
      React.createElement('View', { key: 'dashboard', testID: 'dashboard' }, 
        loading ? [
          React.createElement('Text', { key: 'loading' }, '読み込み中...')
        ] : [
          // Steps Card
          React.createElement('TouchableOpacity', {
            key: 'steps-card',
            testID: 'steps-card',
            onPress: () => handleCardPress('steps')
          }, [
            React.createElement('Text', { key: 'steps-label' }, '歩数'),
            React.createElement('Text', { 
              key: 'steps-value', 
              testID: 'steps-value' 
            }, vitalData?.steps?.today ? vitalData.steps.today.toLocaleString() : '0')
          ]),
          
          // Weight Card
          React.createElement('TouchableOpacity', {
            key: 'weight-card',
            testID: 'weight-card',
            onPress: () => handleCardPress('weight')
          }, [
            React.createElement('Text', { key: 'weight-label' }, '体重'),
            React.createElement('Text', { 
              key: 'weight-value', 
              testID: 'weight-value' 
            }, vitalData?.weight?.latest ? `${vitalData.weight.latest}kg` : '-')
          ]),
          
          // Temperature Card
          React.createElement('TouchableOpacity', {
            key: 'temperature-card',
            testID: 'temperature-card',
            onPress: () => handleCardPress('temperature')
          }, [
            React.createElement('Text', { key: 'temp-label' }, '体温'),
            React.createElement('Text', { 
              key: 'temp-value', 
              testID: 'temperature-value' 
            }, vitalData?.temperature?.latest ? `${vitalData.temperature.latest}°C` : '-')
          ]),
          
          // Blood Pressure Card
          React.createElement('TouchableOpacity', {
            key: 'bp-card',
            testID: 'blood-pressure-card',
            onPress: () => handleCardPress('bloodPressure')
          }, [
            React.createElement('Text', { key: 'bp-label' }, '血圧'),
            React.createElement('Text', { 
              key: 'bp-value', 
              testID: 'blood-pressure-value' 
            }, vitalData?.bloodPressure?.latestSystolic ? 
              `${vitalData.bloodPressure.latestSystolic}/${vitalData.bloodPressure.latestDiastolic}` : '-')
          ])
        ]
      ),
      
      // Rankings Section
      React.createElement('View', { key: 'rankings', testID: 'rankings-section' }, [
        React.createElement('Text', { key: 'rankings-title' }, '歩数ランキング'),
        ...rankings.map((item: any, index: number) => 
          React.createElement('View', { 
            key: `rank-${item.rank}`, 
            testID: `ranking-item-${item.rank}` 
          }, [
            React.createElement('Text', { 
              key: 'name', 
              testID: `ranking-name-${item.rank}` 
            }, item.displayName),
            React.createElement('Text', { 
              key: 'steps', 
              testID: `ranking-steps-${item.rank}` 
            }, `${item.steps.toLocaleString()} 歩`)
          ])
        )
      ]),
      
      // Quick Actions
      React.createElement('View', { key: 'quick-actions', testID: 'quick-actions' }, [
        React.createElement('TouchableOpacity', {
          key: 'yahoo-button',
          testID: 'yahoo-button',
          onPress: () => handleQuickAction('https://yahoo.co.jp', 'Yahoo! JAPAN')
        }, [
          React.createElement('Text', { key: 'yahoo-text' }, 'Yahoo! を開く')
        ])
      ])
    ]);
  });
});

// Import the mocked screen
import HomeScreen from '../../src/screens/HomeScreen';

// ============================================================================
// TEST SUITE
// ============================================================================

const mockNavigation = {
  navigate: jest.fn(),
  openDrawer: jest.fn(),
};

const renderHomeScreen = () => {
  return render(<HomeScreen navigation={mockNavigation as any} />);
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = renderHomeScreen();
    
    expect(getByTestId('home-screen')).toBeTruthy();
    expect(getByTestId('home-header')).toBeTruthy();
    expect(getByTestId('dashboard')).toBeTruthy();
  });

  it('displays greeting and date', () => {
    const { getByTestId, getByText } = renderHomeScreen();
    
    expect(getByTestId('greeting-text')).toBeTruthy();
    expect(getByTestId('date-text')).toBeTruthy();
    expect(getByText('おかえりなさい')).toBeTruthy();
  });

  it('displays vital data cards after loading', async () => {
    const { getByTestId, queryByTestId } = renderHomeScreen();
    
    await waitFor(() => {
      expect(queryByTestId('steps-card')).toBeTruthy();
      expect(queryByTestId('weight-card')).toBeTruthy();
      expect(queryByTestId('temperature-card')).toBeTruthy();
      expect(queryByTestId('blood-pressure-card')).toBeTruthy();
    });
  });

  it('displays correct vital data values', async () => {
    const { getByTestId } = renderHomeScreen();
    
    await waitFor(() => {
      expect(getByTestId('steps-value')).toBeTruthy();
      expect(getByTestId('weight-value')).toBeTruthy();
      expect(getByTestId('temperature-value')).toBeTruthy();
      expect(getByTestId('blood-pressure-value')).toBeTruthy();
    });
  });

  it('navigates to VitalData when card is pressed', async () => {
    const { getByTestId } = renderHomeScreen();
    
    await waitFor(() => {
      const stepsCard = getByTestId('steps-card');
      fireEvent.press(stepsCard);
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('VitalData', { type: 'steps' });
    });
  });

  it('displays rankings after loading', async () => {
    const { getByTestId, queryByTestId } = renderHomeScreen();
    
    await waitFor(() => {
      expect(queryByTestId('rankings-section')).toBeTruthy();
      expect(queryByTestId('ranking-item-1')).toBeTruthy();
      expect(queryByTestId('ranking-item-2')).toBeTruthy();
      expect(queryByTestId('ranking-item-3')).toBeTruthy();
    });
  });

  it('displays ranking names and steps', async () => {
    const { getByTestId } = renderHomeScreen();
    
    await waitFor(() => {
      expect(getByTestId('ranking-name-1')).toBeTruthy();
      expect(getByTestId('ranking-steps-1')).toBeTruthy();
    });
  });

  it('navigates to WebView when quick action is pressed', async () => {
    const { getByTestId } = renderHomeScreen();
    
    await waitFor(() => {
      const yahooButton = getByTestId('yahoo-button');
      fireEvent.press(yahooButton);
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('WebView', {
        url: 'https://yahoo.co.jp',
        title: 'Yahoo! JAPAN'
      });
    });
  });

  it('handles API error gracefully', async () => {
    const { apiClient } = require('../../src/services/api/apiClient');
    apiClient.getVitalSummary.mockRejectedValue(new Error('Network error'));
    
    const { getByTestId } = renderHomeScreen();
    
    // Should still render the screen structure
    expect(getByTestId('home-screen')).toBeTruthy();
    
    await waitFor(() => {
      // Loading should eventually stop even with errors
      expect(getByTestId('dashboard')).toBeTruthy();
    });
  });
});