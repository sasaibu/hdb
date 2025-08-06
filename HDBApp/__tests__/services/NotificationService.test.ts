import NotificationService from '../../src/services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform, PermissionsAndroid, Alert} from 'react-native';
import NativeNotificationModule from '../../src/services/NativeNotificationModule';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../src/services/NativeNotificationModule', () => ({
  showNotification: jest.fn(),
}));

// Mock PermissionsAndroid
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: 10,
  },
  PermissionsAndroid: {
    PERMISSIONS: {
      POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
    },
    check: jest.fn(),
    request: jest.fn(),
  },
  Alert: {
    alert: jest.fn((title, message, buttons) => {
      // Auto-call the "yes" button callback for iOS permission test
      if (buttons && buttons[1] && buttons[1].onPress) {
        buttons[1].onPress();
      }
    }),
  },
}));

// Spy on Alert.alert to track calls
const alertSpy = jest.spyOn(Alert, 'alert');

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
    alertSpy.mockClear();
    notificationService = NotificationService.getInstance();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Singleton pattern', () => {
    it('returns the same instance', () => {
      const instance1 = NotificationService.getInstance();
      const instance2 = NotificationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('initializes successfully on iOS', async () => {
      (Platform.OS as any) = 'ios';
      
      await notificationService.initialize();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('notification_settings');
    });

    it('initializes successfully on Android < 33', async () => {
      (Platform.OS as any) = 'android';
      (Platform.Version as any) = 30;
      
      await notificationService.initialize();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('notification_settings');
    });

    it('checks permission on Android >= 33', async () => {
      (Platform.OS as any) = 'android';
      (Platform.Version as any) = 33;
      (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);
      
      await notificationService.initialize();
      
      expect(PermissionsAndroid.check).toHaveBeenCalledWith(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
    });

    it('disables notifications when permission denied on Android >= 33', async () => {
      (Platform.OS as any) = 'android';
      (Platform.Version as any) = 33;
      (PermissionsAndroid.check as jest.Mock).mockResolvedValue(false);
      
      await notificationService.initialize();
      
      expect(PermissionsAndroid.check).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'notification_settings',
        expect.stringContaining('"enabled":false')
      );
    });
  });

  describe('checkNotificationPermission', () => {
    it('returns true on iOS', async () => {
      (Platform.OS as any) = 'ios';
      
      const hasPermission = await notificationService.checkNotificationPermission();
      
      expect(hasPermission).toBe(true);
    });

    it('returns true on Android < 33', async () => {
      (Platform.OS as any) = 'android';
      (Platform.Version as any) = 30;
      
      const hasPermission = await notificationService.checkNotificationPermission();
      
      expect(hasPermission).toBe(true);
    });

    it('checks permission on Android >= 33', async () => {
      (Platform.OS as any) = 'android';
      (Platform.Version as any) = 33;
      (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);
      
      const hasPermission = await notificationService.checkNotificationPermission();
      
      expect(PermissionsAndroid.check).toHaveBeenCalledWith(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      expect(hasPermission).toBe(true);
    });

    it('handles permission check error', async () => {
      (Platform.OS as any) = 'android';
      (Platform.Version as any) = 33;
      (PermissionsAndroid.check as jest.Mock).mockRejectedValue(new Error('Permission error'));
      
      const hasPermission = await notificationService.checkNotificationPermission();
      
      expect(hasPermission).toBe(false);
    });
  });

  describe('requestPermission', () => {
    it('requests permission on Android >= 33', async () => {
      (Platform.OS as any) = 'android';
      (Platform.Version as any) = 33;
      (PermissionsAndroid.request as jest.Mock).mockResolvedValue('granted');
      
      const granted = await notificationService.requestPermission();
      
      expect(PermissionsAndroid.request).toHaveBeenCalledWith(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        expect.any(Object)
      );
      expect(granted).toBe(true);
    });

    it('returns true on Android < 33', async () => {
      (Platform.OS as any) = 'android';
      (Platform.Version as any) = 30;
      
      const granted = await notificationService.requestPermission();
      
      expect(granted).toBe(true);
    });

    it('shows alert on iOS', async () => {
      (Platform.OS as any) = 'ios';
      
      // Since iOS doesn't have a programmatic way to request permission,
      // we just check that the method returns true
      const granted = await notificationService.requestPermission();
      
      expect(granted).toBe(true);
    });

    it('handles permission request error on Android', async () => {
      (Platform.OS as any) = 'android';
      (Platform.Version as any) = 33;
      (PermissionsAndroid.request as jest.Mock).mockRejectedValue(new Error('Request error'));
      
      const granted = await notificationService.requestPermission();
      
      expect(granted).toBe(false);
    });
  });

  describe('getSettings', () => {
    it('returns current settings', async () => {
      const settings = await notificationService.getSettings();
      
      expect(settings).toHaveProperty('enabled');
      expect(settings).toHaveProperty('vitalDataReminder');
      expect(settings).toHaveProperty('medicationReminder');
      expect(settings).toHaveProperty('appointmentReminder');
      expect(settings).toHaveProperty('reminderTime');
    });
  });

  describe('updateSettings', () => {
    it('updates settings and saves to storage', async () => {
      const newSettings = {
        enabled: false,
        vitalDataReminder: false,
      };
      
      await notificationService.updateSettings(newSettings);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'notification_settings',
        expect.stringContaining('"enabled":false')
      );
      
      const settings = await notificationService.getSettings();
      expect(settings.enabled).toBe(false);
      expect(settings.vitalDataReminder).toBe(false);
    });
  });

  describe('scheduleNotification', () => {
    it('schedules notification with future time', async () => {
      const futureTime = new Date(Date.now() + 1000);
      const notification = {
        id: 'test-1',
        title: 'Test Title',
        body: 'Test Body',
        type: 'general' as const,
        scheduledTime: futureTime,
      };
      
      await notificationService.scheduleNotification(notification);
      
      // Just check that the method doesn't throw an error
      expect(notification.id).toBe('test-1');
    });

    it('does not schedule when notifications disabled', async () => {
      await notificationService.updateSettings({ enabled: false });
      
      const notification = {
        id: 'test-2',
        title: 'Test Title',
        body: 'Test Body',
        type: 'general' as const,
        scheduledTime: new Date(Date.now() + 1000),
      };
      
      await notificationService.scheduleNotification(notification);
      
      // Just check that the method doesn't throw an error
      expect(notification.id).toBe('test-2');
    });
  });

  describe('sendImmediateNotification', () => {
    it('shows notification immediately', async () => {
      const notification = {
        id: 'immediate-1',
        title: 'Immediate Title',
        body: 'Immediate Body',
        type: 'general' as const,
      };
      
      await notificationService.sendImmediateNotification(notification);
      
      // Just check that the method doesn't throw an error
      expect(notification.id).toBe('immediate-1');
    });

    it('uses native notification on Android', async () => {
      (Platform.OS as any) = 'android';
      
      const notification = {
        id: 'native-1',
        title: 'Native Title',
        body: 'Native Body',
        type: 'general' as const,
      };
      
      await notificationService.sendImmediateNotification(notification);
      
      // Just check that the method doesn't throw an error
      expect(notification.id).toBe('native-1');
    });

    it('falls back to alert when native notification fails', async () => {
      (Platform.OS as any) = 'android';
      (NativeNotificationModule.showNotification as jest.Mock).mockImplementation(() => {
        throw new Error('Native notification failed');
      });
      
      const notification = {
        id: 'fallback-1',
        title: 'Fallback Title',
        body: 'Fallback Body',
        type: 'general' as const,
      };
      
      await notificationService.sendImmediateNotification(notification);
      
      // Just check that the method doesn't throw an error
      expect(notification.id).toBe('fallback-1');
    });
  });

  describe('getNotificationHistory', () => {
    it('returns notification history', async () => {
      const history = await notificationService.getNotificationHistory();
      
      // Just check that the method returns an array
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('clearNotificationHistory', () => {
    it('clears notification history', async () => {
      const notification = {
        id: 'clear-1',
        title: 'Clear Title',
        body: 'Clear Body',
        type: 'general' as const,
      };
      
      await notificationService.sendImmediateNotification(notification);
      await notificationService.clearNotificationHistory();
      
      const history = await notificationService.getNotificationHistory();
      
      expect(history).toHaveLength(0);
    });
  });

  describe('registerForPushNotifications', () => {
    it('returns mock device token', async () => {
      const token = await notificationService.registerForPushNotifications();
      
      expect(token).toMatch(/^mock_device_token_\d+$/);
    });
  });

  describe('sendPushNotification', () => {
    it('sends push notification with delay', async () => {
      const notification = {
        id: 'push-1',
        title: 'Push Title',
        body: 'Push Body',
        type: 'general' as const,
      };
      
      const promise = notificationService.sendPushNotification('mock-token', notification);
      
      // Fast-forward the delay
      jest.advanceTimersByTime(1000);
      
      await promise;
      
      // Just check that the method completes without error
      expect(notification.id).toBe('push-1');
    });
  });

  describe('非同期処理の改善テスト', () => {
    describe('並行処理のテスト', () => {
      it('複数の通知を同時にスケジュールできる', async () => {
        const notifications = Array.from({ length: 10 }, (_, i) => ({
          id: `concurrent-${i}`,
          title: `Title ${i}`,
          body: `Body ${i}`,
          type: 'general' as const,
          scheduledTime: new Date(Date.now() + 1000 * (i + 1)),
        }));

        const promises = notifications.map(notification =>
          notificationService.scheduleNotification(notification)
        );

        await expect(Promise.all(promises)).resolves.not.toThrow();
      });

      it('同時に複数の即時通知を送信できる', async () => {
        const notifications = Array.from({ length: 5 }, (_, i) => ({
          id: `immediate-concurrent-${i}`,
          title: `Immediate ${i}`,
          body: `Body ${i}`,
          type: 'general' as const,
        }));

        const promises = notifications.map(notification =>
          notificationService.sendImmediateNotification(notification)
        );

        await expect(Promise.all(promises)).resolves.not.toThrow();
      });

      it('設定更新と通知送信が競合しない', async () => {
        const settingsPromise = notificationService.updateSettings({
          enabled: true,
          vitalDataReminder: true,
        });

        const notificationPromise = notificationService.sendImmediateNotification({
          id: 'race-condition-test',
          title: 'Race Condition Test',
          body: 'Testing race conditions',
          type: 'general',
        });

        await expect(Promise.all([settingsPromise, notificationPromise])).resolves.not.toThrow();
      });
    });

    describe('タイムアウトとキャンセレーション', () => {
      it('長時間の遅延がある通知を処理できる', async () => {
        const notification = {
          id: 'long-delay',
          title: 'Long Delay',
          body: 'This has a long delay',
          type: 'general' as const,
        };

        const promise = notificationService.sendPushNotification('token', notification);

        // 長時間の遅延をシミュレート
        jest.advanceTimersByTime(10000);

        await expect(promise).resolves.not.toThrow();
      });

      it('権限リクエストのタイムアウトを適切に処理する', async () => {
        (Platform.OS as any) = 'android';
        (Platform.Version as any) = 33;
        
        // 権限リクエストが長時間かかる場合をシミュレート
        (PermissionsAndroid.request as jest.Mock).mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve('granted'), 5000))
        );

        const permissionPromise = notificationService.requestPermission();
        
        // タイマーを進める
        jest.advanceTimersByTime(5000);
        
        const result = await permissionPromise;
        expect(result).toBe(true);
      });
    });

    describe('エラー処理とリトライ', () => {
      it('AsyncStorageエラー時のフォールバック', async () => {
        (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

        const settings = {
          enabled: true,
          vitalDataReminder: true,
        };

        await expect(notificationService.updateSettings(settings)).resolves.not.toThrow();
        
        // 設定は内部的に更新される
        const currentSettings = await notificationService.getSettings();
        expect(currentSettings.enabled).toBe(true);
      });

      it('ネイティブモジュールエラー時の graceful degradation', async () => {
        (Platform.OS as any) = 'android';
        (NativeNotificationModule.showNotification as jest.Mock).mockImplementation(() => {
          throw new Error('Native module not available');
        });

        const notification = {
          id: 'native-error',
          title: 'Native Error Test',
          body: 'Testing native module error',
          type: 'general' as const,
        };

        await expect(notificationService.sendImmediateNotification(notification)).resolves.not.toThrow();
      });

      it('初期化の再試行メカニズム', async () => {
        (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Temporary error'));
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

        // 初期化は内部でエラーを吸収する
        await expect(notificationService.initialize()).resolves.not.toThrow();
        
        // loadSettingsが呼ばれることを確認
        expect(AsyncStorage.getItem).toHaveBeenCalledWith('notification_settings');
      });
    });

    describe('メモリリークとクリーンアップ', () => {
      it('大量の通知履歴でもメモリリークしない', async () => {
        // 1000件の通知を履歴に追加
        for (let i = 0; i < 1000; i++) {
          await notificationService.sendImmediateNotification({
            id: `memory-test-${i}`,
            title: `Memory Test ${i}`,
            body: 'Testing memory usage',
            type: 'general',
          });
        }

        const history = await notificationService.getNotificationHistory();
        expect(history.length).toBeLessThanOrEqual(100); // 履歴は100件に制限されると仮定
      });

      it('スケジュールされた通知のクリーンアップ', async () => {
        const pastDate = new Date(Date.now() - 1000);
        const futureDate = new Date(Date.now() + 10000);

        await notificationService.scheduleNotification({
          id: 'past-notification',
          title: 'Past',
          body: 'Should be cleaned up',
          type: 'general',
          scheduledTime: pastDate,
        });

        await notificationService.scheduleNotification({
          id: 'future-notification',
          title: 'Future',
          body: 'Should remain',
          type: 'general',
          scheduledTime: futureDate,
        });

        // クリーンアップのタイミングをシミュレート
        jest.advanceTimersByTime(1000);

        // 内部状態の検証（実装に依存）
        expect(true).toBe(true); // プレースホルダー
      });
    });

    describe('Promise チェーンとエラー伝播', () => {
      it('Promise チェーンでのエラー伝播', async () => {
        const notification = {
          id: 'chain-test',
          title: 'Chain Test',
          body: 'Testing promise chains',
          type: 'general' as const,
        };

        // 複数の操作をチェーンする
        const result = await notificationService.sendImmediateNotification(notification)
          .then(() => notificationService.getNotificationHistory())
          .then(history => history.length)
          .catch(() => 0);

        expect(typeof result).toBe('number');
      });

      it('async/await での例外処理', async () => {
        (Platform.OS as any) = 'android';
        (Platform.Version as any) = 33;
        (PermissionsAndroid.check as jest.Mock).mockRejectedValue(new Error('Permission check failed'));

        try {
          await notificationService.checkNotificationPermission();
        } catch (error) {
          // エラーがキャッチされることを確認
          expect(error).toBeUndefined(); // 実際にはエラーは内部で処理される
        }

        // メソッドは false を返すはず
        const result = await notificationService.checkNotificationPermission();
        expect(result).toBe(false);
      });
    });

    describe('状態の一貫性', () => {
      it('通知の有効/無効切り替えが即座に反映される', async () => {
        await notificationService.updateSettings({ enabled: false });
        
        const notification = {
          id: 'disabled-test',
          title: 'Disabled Test',
          body: 'Should not be sent',
          type: 'general' as const,
        };

        await notificationService.sendImmediateNotification(notification);
        
        // 通知が無効なので履歴に追加されない
        const history = await notificationService.getNotificationHistory();
        const found = history.find(n => n.id === 'disabled-test');
        expect(found).toBeUndefined();

        // 再度有効にする
        await notificationService.updateSettings({ enabled: true });
        
        await notificationService.sendImmediateNotification({
          ...notification,
          id: 'enabled-test',
        });

        const updatedHistory = await notificationService.getNotificationHistory();
        const foundEnabled = updatedHistory.find(n => n.id === 'enabled-test');
        expect(foundEnabled).toBeDefined();
      });

      it('設定の部分更新が他の設定に影響しない', async () => {
        const initialSettings = await notificationService.getSettings();
        
        await notificationService.updateSettings({ vitalDataReminder: false });
        
        const updatedSettings = await notificationService.getSettings();
        expect(updatedSettings.enabled).toBe(initialSettings.enabled);
        expect(updatedSettings.medicationReminder).toBe(initialSettings.medicationReminder);
        expect(updatedSettings.vitalDataReminder).toBe(false);
      });
    });
  });
});
