import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert, Platform, PermissionsAndroid} from 'react-native';
import NativeNotificationModule from './NativeNotificationModule';

export interface NotificationSettings {
  enabled: boolean;
  vitalDataReminder: boolean;
  medicationReminder: boolean;
  appointmentReminder: boolean;
  reminderTime: string;
  // 新仕様追加項目
  newAnnouncementNotification: boolean;
  unreadExamNotification: boolean;
  pulseSurveyNotification: boolean;
  stressCheckNotification: boolean;
}

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  scheduledTime?: Date;
  type: 'vital' | 'medication' | 'appointment' | 'general';
}

class NotificationService {
  private static instance: NotificationService;
  private settings: NotificationSettings = {
    enabled: true,
    vitalDataReminder: true,
    medicationReminder: true,
    appointmentReminder: true,
    reminderTime: '09:00',
    // 新仕様追加項目のデフォルト値
    newAnnouncementNotification: true,
    unreadExamNotification: true,
    pulseSurveyNotification: true,
    stressCheckNotification: true,
  };

  private notifications: NotificationData[] = [];
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    console.log('NotificationService initialized');
    await this.loadSettings();
    
    // Android 13以降で通知権限をチェック
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const hasPermission = await this.checkNotificationPermission();
      if (!hasPermission) {
        // 権限がない場合は通知を無効にする
        this.settings.enabled = false;
        await this.updateSettings({enabled: false});
      }
    }
    
    if (this.settings.enabled) {
      this.scheduleDefaultNotifications();
    }
  }

  async checkNotificationPermission(): Promise<boolean> {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted;
      } catch (err) {
        console.warn('Permission check error:', err);
        return false;
      }
    }
    return true; // iOS or Android < 13
  }

  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        // Android 13以降では通知権限が必要
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: '通知の許可',
              message: 'アプリからの通知を受け取るために許可が必要です',
              buttonNeutral: 'あとで確認',
              buttonNegative: '拒否',
              buttonPositive: '許可',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
          console.warn('Permission request error:', err);
          return false;
        }
      } else {
        // Android 12以前は権限不要
        return true;
      }
    }
    
    // iOS用のモック実装
    return new Promise((resolve) => {
      Alert.alert(
        '通知の許可',
        'アプリからの通知を許可しますか？',
        [
          {
            text: 'いいえ',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'はい',
            onPress: () => resolve(true),
          },
        ],
      );
    });
  }

  async getSettings(): Promise<NotificationSettings> {
    return this.settings;
  }

  async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    this.settings = {...this.settings, ...newSettings};
    
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save notification settings:', error);
      // Continue without throwing - settings are updated in memory
    }
    
    // Reschedule notifications based on new settings
    this.clearAllScheduledNotifications();
    if (this.settings.enabled) {
      this.scheduleDefaultNotifications();
    }
  }

  async scheduleNotification(notification: NotificationData): Promise<void> {
    if (!this.settings.enabled) {
      return;
    }

    const delay = notification.scheduledTime 
      ? notification.scheduledTime.getTime() - Date.now()
      : 5000; // Default 5 seconds for testing

    if (delay > 0) {
      const timeoutId = setTimeout(() => {
        this.showNotification(notification);
        this.scheduledNotifications.delete(notification.id);
      }, delay);

      this.scheduledNotifications.set(notification.id, timeoutId);
    }
  }

  async sendImmediateNotification(notification: NotificationData): Promise<void> {
    if (!this.settings.enabled) {
      return;
    }

    this.showNotification(notification);
  }

  private showNotification(notification: NotificationData): void {
    if (Platform.OS === 'android') {
      // Android: 実際の通知を表示
      try {
        NativeNotificationModule.showNotification({
          title: notification.title,
          body: notification.body,
          id: parseInt(notification.id.replace(/[^0-9]/g, '')) || Math.floor(Math.random() * 1000000),
        });
      } catch (error) {
        console.error('Failed to show native notification:', error);
        // Fallback to Alert
        this.showFallbackAlert(notification);
      }
    } else {
      // iOS: Alertを使用（フォールバック）
      this.showFallbackAlert(notification);
    }

    // Store in notification history
    this.notifications.push({
      ...notification,
      scheduledTime: new Date(),
    });

    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(-50);
    }
  }

  private showFallbackAlert(notification: NotificationData): void {
    Alert.alert(
      notification.title,
      notification.body,
      [
        {
          text: 'OK',
          onPress: () => {
            console.log('Notification dismissed:', notification.id);
            // Here you could handle navigation or other actions
          },
        },
      ],
    );
  }

  async getNotificationHistory(): Promise<NotificationData[]> {
    return this.notifications.slice().reverse(); // Return newest first
  }

  async clearNotificationHistory(): Promise<void> {
    this.notifications = [];
  }

  private scheduleDefaultNotifications(): void {
    if (this.settings.vitalDataReminder) {
      this.scheduleDailyReminder({
        id: 'vital_reminder',
        title: 'バイタルデータ入力',
        body: '今日のバイタルデータを入力してください',
        type: 'vital',
      });
    }

    if (this.settings.medicationReminder) {
      this.scheduleDailyReminder({
        id: 'medication_reminder',
        title: '服薬リマインダー',
        body: 'お薬の時間です',
        type: 'medication',
      });
    }

    if (this.settings.appointmentReminder) {
      this.scheduleTestNotification();
    }
  }

  private scheduleDailyReminder(notification: Omit<NotificationData, 'scheduledTime'>): void {
    const [hours, minutes] = this.settings.reminderTime.split(':');
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    this.scheduleNotification({
      ...notification,
      scheduledTime,
    });
  }

  private scheduleTestNotification(): void {
    // Schedule a test notification 10 seconds from now
    const testTime = new Date();
    testTime.setSeconds(testTime.getSeconds() + 10);

    this.scheduleNotification({
      id: 'test_notification',
      title: 'テスト通知',
      body: 'プッシュ通知が正常に動作しています',
      type: 'general',
      scheduledTime: testTime,
    });
  }

  private clearAllScheduledNotifications(): void {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  private async loadSettings(): Promise<void> {
    try {
      const savedSettings = await AsyncStorage.getItem('notification_settings');
      if (savedSettings) {
        this.settings = {...this.settings, ...JSON.parse(savedSettings)};
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }

  // Mock push notification methods
  async registerForPushNotifications(): Promise<string | null> {
    // Mock device token
    const mockToken = `mock_device_token_${Date.now()}`;
    console.log('Mock device token:', mockToken);
    return mockToken;
  }

  async sendPushNotification(
    token: string,
    notification: NotificationData,
  ): Promise<void> {
    // Mock push notification sending
    console.log('Sending push notification to token:', token);
    console.log('Notification data:', notification);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show the notification locally as if it came from a server
    this.showNotification(notification);
  }
}

export default NotificationService;
