import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';

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

  // Special ActivityIndicator component
  const MockActivityIndicator = React.forwardRef((props: any, ref: any) => {
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
    Text: MockText,
    TouchableOpacity: MockTouchableOpacity,
    SafeAreaView: mockComponent('SafeAreaView'),
    ActivityIndicator: MockActivityIndicator,
    
    // StyleSheet
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
    },
  };
});

// Mock react-native-webview
jest.mock('react-native-webview', () => {
  const React = require('react');
  return {
    WebView: React.forwardRef((props: any, ref: any) => {
      return React.createElement('View', {
        ...props,
        ref,
        testID: props.testID || 'webview',
        'data-component': 'WebView'
      }, [
        React.createElement('Text', { key: 'url' }, `Loading: ${props.source?.uri || 'No URL'}`),
        props.renderLoading && React.createElement('View', { 
          key: 'loading', 
          testID: 'webview-loading' 
        }, props.renderLoading())
      ]);
    }),
  };
});

import WebViewScreen from '../../src/screens/WebViewScreen';

const mockGoBack = jest.fn();
const mockSetOptions = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
  setOptions: mockSetOptions,
  navigate: jest.fn(),
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
    url: 'https://example.com',
    title: 'Example Website',
  },
};

describe('WebViewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with loading state', () => {
    const {getByText, getByTestId} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByText('読み込み中...')).toBeTruthy();
    expect(getByTestId('ActivityIndicator')).toBeTruthy();
  });

  it('displays WebView with correct URL', () => {
    const {getByTestId, getByText} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Check if WebView component is rendered
    expect(getByTestId('webview')).toBeTruthy();
    expect(getByText('Loading: https://example.com')).toBeTruthy();
  });

  it('sets navigation title correctly', () => {
    render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(mockSetOptions).toHaveBeenCalledWith({
      title: 'Example Website',
    });
  });

  it('sets default title when title is not provided', () => {
    const routeWithoutTitle = {
      params: {
        url: 'https://example.com',
      },
    };

    render(
      <WebViewScreen navigation={mockNavigation as any} route={routeWithoutTitle as any} />
    );

    expect(mockSetOptions).toHaveBeenCalledWith({
      title: 'Web',
    });
  });

  it('displays loading indicator initially', () => {
    const {getByText, getByTestId} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByText('読み込み中...')).toBeTruthy();
    expect(getByTestId('ActivityIndicator')).toBeTruthy();
  });

  it('renders WebView component', () => {
    const {getByTestId} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByTestId('webview')).toBeTruthy();
  });

  it('handles URL parameter correctly', () => {
    const {getByText} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByText('Loading: https://example.com')).toBeTruthy();
  });

  it('handles missing URL parameter', () => {
    const invalidRoute = {
      params: {
        title: 'No URL',
      },
    };

    const {getByText} = render(
      <WebViewScreen navigation={mockNavigation as any} route={invalidRoute as any} />
    );

    expect(getByText('Loading: No URL')).toBeTruthy();
  });

  it('renders SafeAreaView container', () => {
    const {getByTestId} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByTestId('SafeAreaView')).toBeTruthy();
  });

  it('handles component lifecycle correctly', () => {
    const {getByTestId} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Component should render without errors
    expect(getByTestId('SafeAreaView')).toBeTruthy();
    expect(getByTestId('webview')).toBeTruthy();
  });
});
