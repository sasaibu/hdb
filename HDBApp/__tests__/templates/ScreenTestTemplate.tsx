import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';

// ============================================================================
// UNIVERSAL REACT NATIVE MOCKS
// ============================================================================

// Mock React Native components with simple, reliable behavior
jest.mock('react-native', () => {
  const React = require('react');
  
  // Create a simple mock component that preserves props and children
  const mockComponent = (componentName: string) => 
    React.forwardRef((props: any, ref: any) => {
      return React.createElement('View', {
        ...props,
        ref,
        testID: props.testID || componentName,
        'data-component': componentName,
      }, props.children);
    });

  // Special Text component that properly renders children
  const MockText = React.forwardRef((props: any, ref: any) => {
    return React.createElement('Text', {
      ...props,
      ref,
      testID: props.testID || 'Text',
      'data-component': 'Text'
    }, props.children);
  });

  // Special TouchableOpacity that handles press events
  const MockTouchableOpacity = React.forwardRef((props: any, ref: any) => {
    return React.createElement('TouchableOpacity', {
      ...props,
      ref,
      testID: props.testID || 'TouchableOpacity',
      'data-component': 'TouchableOpacity',
      onPress: props.onPress
    }, props.children);
  });

  return {
    // Basic components
    View: mockComponent('View'),
    Text: MockText,
    ScrollView: mockComponent('ScrollView'),
    TouchableOpacity: MockTouchableOpacity,
    TouchableHighlight: mockComponent('TouchableHighlight'),
    Pressable: mockComponent('Pressable'),
    Image: mockComponent('Image'),
    TextInput: mockComponent('TextInput'),
    Switch: mockComponent('Switch'),
    Button: mockComponent('Button'),
    
    // Layout components
    SafeAreaView: mockComponent('SafeAreaView'),
    KeyboardAvoidingView: mockComponent('KeyboardAvoidingView'),
    
    // Loading and feedback
    ActivityIndicator: mockComponent('ActivityIndicator'),
    RefreshControl: mockComponent('RefreshControl'),
    
    // Lists
    FlatList: mockComponent('FlatList'),
    SectionList: mockComponent('SectionList'),
    
    // Modal
    Modal: mockComponent('Modal'),
    
    // Alert
    Alert: {
      alert: jest.fn(),
      prompt: jest.fn(),
    },
    
    // Platform
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
    },
    
    // Dimensions
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
    },
    
    // StyleSheet
    StyleSheet: {
      create: jest.fn((styles) => styles),
    },
  };
});

// ============================================================================
// NAVIGATION MOCKS
// ============================================================================

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useFocusEffect: jest.fn(),
  useRoute: () => ({ params: {} }),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn(),
  StackNavigationProp: {},
}));

jest.mock('@react-navigation/drawer', () => ({
  createDrawerNavigator: jest.fn(),
  DrawerNavigationProp: {},
}));

// ============================================================================
// API/SERVICE MOCKS
// ============================================================================

// Mock API client with default success responses
jest.mock('../../src/services/api/apiClient', () => ({
  apiClient: {
    // Backup related APIs
    createBackup: jest.fn().mockResolvedValue({
      success: true,
      message: 'バックアップが完了しました',
      data: {
        backupId: 'backup-123',
        size: 1024,
        createdAt: '2025-08-05T10:00:00Z',
      },
    }),
    getBackupHistory: jest.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
    
    // Vital data APIs
    getVitalSummary: jest.fn().mockResolvedValue({
      success: true,
      data: {
        steps: { today: 8456 },
        weight: { latest: 65.2 },
        temperature: { latest: 36.5 },
        bloodPressure: { latestSystolic: 120, latestDiastolic: 80 },
      },
    }),
    
    // Other common APIs
    getRankings: jest.fn().mockResolvedValue({
      success: true,
      data: [
        { rank: 1, displayName: '田中 太郎', steps: 12345 },
        { rank: 2, displayName: '鈴木 花子', steps: 11234 },
      ],
    }),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
}));

// ============================================================================
// NAVIGATION OBJECT
// ============================================================================

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  openDrawer: jest.fn(),
  closeDrawer: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  canGoBack: jest.fn(),
  isFocused: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  setOptions: jest.fn(),
  setParams: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  getId: jest.fn(),
};

// ============================================================================
// MOCK SCREEN COMPONENT (REPLACE WITH ACTUAL SCREEN)
// ============================================================================

// This is where you would import your actual screen component
// For template purposes, we'll create a mock screen
const MockScreen = ({ navigation }: { navigation: any }) => {
  return React.createElement('View', { testID: 'screen-container' }, [
    React.createElement('Text', { key: 'title', testID: 'screen-title' }, 'Screen Title'),
    React.createElement('TouchableOpacity', {
      key: 'button',
      testID: 'main-button',
      onPress: () => navigation.navigate('NextScreen')
    }, [
      React.createElement('Text', { key: 'button-text' }, 'Button Text')
    ])
  ]);
};

// ============================================================================
// TEST HELPER FUNCTIONS
// ============================================================================

const renderScreen = (props = {}) => {
  return render(
    React.createElement(MockScreen, {
      navigation: mockNavigation,
      ...props
    })
  );
};

// ============================================================================
// TEST SUITE TEMPLATE
// ============================================================================

describe('ScreenTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic rendering test
  it('renders correctly', () => {
    const { getByTestId } = renderScreen();
    
    expect(getByTestId('screen-container')).toBeTruthy();
    expect(getByTestId('screen-title')).toBeTruthy();
    expect(getByTestId('main-button')).toBeTruthy();
  });

  // Text content test
  it('displays correct text content', () => {
    const { getByText } = renderScreen();
    
    expect(getByText('Screen Title')).toBeTruthy();
    expect(getByText('Button Text')).toBeTruthy();
  });

  // Navigation test
  it('navigates correctly when button is pressed', () => {
    const { getByTestId } = renderScreen();
    
    const button = getByTestId('main-button');
    fireEvent.press(button);
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('NextScreen');
  });

  // Loading state test
  it('shows loading state when processing', async () => {
    // Mock API to simulate loading
    const { apiClient } = require('../../src/services/api/apiClient');
    apiClient.createBackup.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    const { getByTestId, queryByTestId } = renderScreen();
    
    // Trigger action that causes loading
    const button = getByTestId('main-button');
    fireEvent.press(button);
    
    // Check loading indicator appears (if your screen has one)
    // expect(queryByTestId('loading-indicator')).toBeTruthy();
    
    // Wait for loading to complete
    await waitFor(() => {
      // expect(queryByTestId('loading-indicator')).toBeFalsy();
    });
  });

  // Error handling test
  it('handles errors gracefully', async () => {
    const { Alert } = require('react-native');
    const { apiClient } = require('../../src/services/api/apiClient');
    
    // Mock API to throw error
    apiClient.createBackup.mockRejectedValue(new Error('Network error'));
    
    const { getByTestId } = renderScreen();
    
    const button = getByTestId('main-button');
    fireEvent.press(button);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        expect.any(String)
      );
    });
  });
});

// ============================================================================
// EXPORT HELPERS FOR REUSE
// ============================================================================

export {
  mockNavigation,
  renderScreen,
};