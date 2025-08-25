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
import {GoalProvider} from './src/contexts/GoalContext';
import notifee, { TriggerType, RepeatFrequency } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import './src/utils/DatabaseDebugger'; // デバッグユーティリティを読み込み

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Initialize notifications with notifee
    const initializeNotifications = async () => {
      try {
        // Request permissions
        await notifee.requestPermission();
        
        // Create notification channel for Android
        await notifee.createChannel({
          id: 'default',
          name: 'デフォルト通知',
        });
        
        // Load notification settings
        const settings = await loadNotificationSettings();
        
        // Schedule daily notifications if enabled
        if (settings.enabled) {
          await scheduleNotifications(settings);
        }
        
        console.log('Notifee notifications initialized successfully');
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();
  }, []);
  
  // Load notification settings from storage
  const loadNotificationSettings = async () => {
    try {
      const reminderTime = await AsyncStorage.getItem('reminderTime') || '09:00';
      const enabled = await AsyncStorage.getItem('notificationEnabled') !== 'false';
      const vitalDataReminder = await AsyncStorage.getItem('vitalDataReminder') !== 'false';
      const medicationReminder = await AsyncStorage.getItem('medicationReminder') !== 'false';
      
      return {
        enabled,
        reminderTime,
        vitalDataReminder,
        medicationReminder,
      };
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      return {
        enabled: true,
        reminderTime: '09:00',
        vitalDataReminder: true,
        medicationReminder: true,
      };
    }
  };
  
  // Schedule daily notifications with notifee
  const scheduleNotifications = async (settings: any) => {
    try {
      const [hours, minutes] = settings.reminderTime.split(':');
      const scheduledTime = getNextScheduleTime(parseInt(hours), parseInt(minutes));
      
      // Cancel existing notifications
      await notifee.cancelNotification('vital-reminder');
      await notifee.cancelNotification('medication-reminder');
      
      // Schedule vital data reminder
      if (settings.vitalDataReminder) {
        await notifee.createTriggerNotification(
          {
            id: 'vital-reminder',
            title: 'バイタルデータ入力',
            body: '今日のバイタルデータを入力してください',
            android: {
              channelId: 'default',
            },
          },
          {
            type: TriggerType.TIMESTAMP,
            timestamp: scheduledTime.getTime(),
            repeatFrequency: RepeatFrequency.DAILY,
          }
        );
      }
      
      // Schedule medication reminder
      if (settings.medicationReminder) {
        await notifee.createTriggerNotification(
          {
            id: 'medication-reminder',
            title: '服薬リマインダー',
            body: 'お薬の時間です',
            android: {
              channelId: 'default',
            },
          },
          {
            type: TriggerType.TIMESTAMP,
            timestamp: scheduledTime.getTime(),
            repeatFrequency: RepeatFrequency.DAILY,
          }
        );
      }
      
      console.log(`Daily notifications scheduled for ${settings.reminderTime}`);
    } catch (error) {
      console.error('Failed to schedule notifications:', error);
    }
  };
  
  // Calculate next schedule time
  const getNextScheduleTime = (hour: number, minute: number) => {
    const now = new Date();
    const scheduledDate = new Date();
    scheduledDate.setHours(hour, minute, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    
    return scheduledDate;
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ErrorBoundary>
        <GoalProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <AppNavigator />
        </GoalProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

export default App;
