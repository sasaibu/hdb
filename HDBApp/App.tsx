/**
 * HDB Mobile App
 * Health Data Bank React Native Application
 *
 * @format
 */

import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import {ErrorBoundary} from './src/utils/ErrorHandler';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ErrorBoundary>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppNavigator />
    </ErrorBoundary>
  );
}

export default App;
