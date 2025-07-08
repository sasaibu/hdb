/**
 * HDB Mobile App
 * Health Data Bank React Native Application
 *
 * @format
 */

import React, { useEffect } from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import {ErrorBoundary} from './src/utils/ErrorHandler';
import './src/utils/DatabaseDebugger'; // デバッグユーティリティを読み込み

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ErrorBoundary>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppNavigator />
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

export default App;
