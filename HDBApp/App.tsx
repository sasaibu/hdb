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
import NotificationService from './src/services/NotificationService';
import './src/utils/DatabaseDebugger'; // デバッグユーティリティを読み込み

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Initialize notification service when app starts
    const initializeNotifications = async () => {
      try {
        await NotificationService.getInstance().initialize();
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

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
