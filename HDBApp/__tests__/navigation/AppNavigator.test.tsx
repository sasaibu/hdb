import React from 'react';
import {render, waitFor} from '@testing-library/react-native';
import AppNavigator from '../../src/navigation/AppNavigator';

// Mock react-navigation modules
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: ({component: Component}: {component: React.ComponentType}) => (
      <Component />
    ),
  }),
}));

jest.mock('@react-navigation/drawer', () => ({
  createDrawerNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: ({component: Component}: {component: React.ComponentType}) => (
      <Component />
    ),
  }),
}));

// Mock screen components
jest.mock('../../src/screens/SplashScreen', () => {
  const ReactLib = require('react');
  const {Text} = require('react-native');
  return function SplashScreen() {
    return ReactLib.createElement(Text, {testID: 'splash-screen'}, 'Splash Screen');
  };
});

jest.mock('../../src/screens/LoginScreen', () => {
  const ReactLib = require('react');
  const {Text} = require('react-native');
  return function LoginScreen() {
    return ReactLib.createElement(Text, {testID: 'login-screen'}, 'Login Screen');
  };
});

jest.mock('../../src/screens/HomeScreen', () => {
  const ReactLib = require('react');
  const {Text} = require('react-native');
  return function HomeScreen() {
    return ReactLib.createElement(Text, {testID: 'home-screen'}, 'Home Screen');
  };
});

jest.mock('../../src/screens/WebViewScreen', () => {
  const ReactLib = require('react');
  const {Text} = require('react-native');
  return function WebViewScreen() {
    return ReactLib.createElement(Text, {testID: 'webview-screen'}, 'WebView Screen');
  };
});

describe('AppNavigator', () => {
  it('renders without crashing', async () => {
    const {getByTestId} = render(<AppNavigator />);
    
    await waitFor(() => {
      expect(getByTestId('splash-screen')).toBeTruthy();
    });
  });

  it('contains navigation structure', () => {
    const {UNSAFE_root} = render(<AppNavigator />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
