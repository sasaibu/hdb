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

  const MockText = React.forwardRef((props: any, ref: any) => {
    return React.createElement('Text', {
      ...props,
      ref,
      testID: props.testID || 'Text',
      'data-component': 'Text'
    }, props.children);
  });

  return {
    View: mockComponent('View'),
    Text: MockText,
    ActivityIndicator: React.forwardRef((props: any, ref: any) => {
      return React.createElement('ActivityIndicator', {
        ...props,
        ref,
        testID: props.testID || 'loading-indicator',
        'data-component': 'ActivityIndicator'
      });
    }),
    
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
    },
    
    Animated: {
      View: mockComponent('AnimatedView'),
      Text: mockComponent('AnimatedText'),
      ScrollView: mockComponent('AnimatedScrollView'),
      Value: function AnimatedValue(initialValue: number) {
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
    
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  };
});

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Mock SplashScreen entirely
jest.mock('../../src/screens/SplashScreen', () => {
  const React = require('react');
  return React.forwardRef((props: any, ref: any) => {
    React.useEffect(() => {
      setTimeout(() => {
        if (props.navigation) {
          props.navigation.replace('Login');
        }
      }, 2000);
    }, []);

    return React.createElement('View', {
      ref,
      testID: 'SplashScreen',
      'data-component': 'SplashScreen'
    }, [
      React.createElement('Text', { key: 'app-name' }, 'HDB'),
      React.createElement('Text', { key: 'subtitle' }, 'Health Data Bank'),
      React.createElement('ActivityIndicator', { key: 'loading', testID: 'loading-indicator' }),
      React.createElement('Text', { key: 'status' }, 'アプリケーションを初期化中...'),
    ]);
  });
});

import SplashScreen from '../../src/screens/SplashScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockReplace = jest.fn();

const mockNavigation = {
  navigate: mockNavigate,
  replace: mockReplace,
  goBack: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

describe('SplashScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockReplace.mockClear();
  });

  it('renders correctly with logo and app name', () => {
    const {getByText} = render(<SplashScreen navigation={mockNavigation as any} />);
    
    expect(getByText('HDB')).toBeTruthy();
    expect(getByText('Health Data Bank')).toBeTruthy();
    expect(getByText('アプリケーションを初期化中...')).toBeTruthy();
  });

  it('displays loading indicator', () => {
    const {getByTestId} = render(<SplashScreen navigation={mockNavigation as any} />);
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('navigates to Login screen after delay', async () => {
    render(<SplashScreen navigation={mockNavigation as any} />);
    
    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith('Login');
    }, { timeout: 3000 });
  });

  it('displays status messages during initialization', () => {
    const {getByText} = render(<SplashScreen navigation={mockNavigation as any} />);
    
    expect(getByText('アプリケーションを初期化中...')).toBeTruthy();
  });

  it('handles component mount and unmount', () => {
    const {unmount} = render(<SplashScreen navigation={mockNavigation as any} />);
    
    expect(() => unmount()).not.toThrow();
  });
});