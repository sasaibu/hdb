import NotificationService from '../../src/services/NotificationService';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform, PermissionsAndroid} from 'react-native';

// Mock dependencies
jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getToken: jest.fn(),
    requestPermission: jest.fn(),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    getInitialNotification: jest.fn(),
    setBackgroundMessageHandler: jest.fn(),
    deleteToken: jest.fn(),
  })),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  PermissionsAndroid: {
    request: jest.fn(),
    PERMISSIONS: {
      POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
    },
  },
  Alert: {
    alert: jest.fn(),
  },
}));

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockMessaging: any;

  beforeEach(() => {
    jest.clearAllMocks();
    notificationService = NotificationService.getInstance();
    mockMessaging = messaging();
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
      mockMessaging.requestPermission.mockResolvedValue(1);
      mockMessaging.getToken.mockResolvedValue('test-token-123');

      await notificationService.initialize();

      expect(mockMessaging.requestPermission).toHaveBeenCalled();
      expect(mockMessaging.getToken).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('fcm_token', 'test-token-123');
    });

    it('initializes successfully on Android', async () => {
      (Platform.OS as any) = 'android';
      (PermissionsAndroid.request as jest.Mock).mockResolvedValue('granted');
      mockMessaging.getToken.mockResolvedValue('test-token-456');

      await notificationService.initialize();

      expect(PermissionsAndroid.request).toHaveBeenCalledWith(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      expect(mockMessaging.getToken).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('fcm_token', 'test-token-456');
    });

    it('handles permission denied on iOS', async () => {
      mockMessaging.requestPermission.mockResolvedValue(0);

      await notificationService.initialize();

      expect(mockMessaging.requestPermission).toHaveBeenCalled();
      expect(mockMessaging.getToken).not.toHaveBeenCalled();
    });

    it('handles permission denied on Android', async () => {
      (Platform.OS as any) = 'android';
      (PermissionsAndroid.request as jest.Mock).mockResolvedValue('denied');

      await notificationService.initialize();

      expect(PermissionsAndroid.request).toHaveBeenCalled();
      expect(mockMessaging.getToken).not.toHaveBeenCalled();
    });

    it('handles token generation error', async () => {
      mockMessaging.requestPermission.mockResolvedValue(1);
      mockMessaging.getToken.mockRejectedValue(new Error('Token error'));

      await notificationService.initialize();

      expect(mockMessaging.requestPermission).toHaveBeenCalled();
      expect(mockMessaging.getToken).toHaveBeenCalled();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getToken', () => {
    it('returns stored token', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('stored-token');

      const token = await notificationService.getToken();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('fcm_token');
      expect(token).toBe('stored-token');
    });

    it('returns null when no token stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const token = await notificationService.getToken();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('fcm_token');
      expect(token).toBeNull();
    });
  });

  describe('deleteToken', () => {
    it('deletes token successfully', async () => {
      await notificationService.deleteToken();

      expect(mockMessaging.deleteToken).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('fcm_token');
    });

    it('handles deletion error gracefully', async () => {
      mockMessaging.deleteToken.mockRejectedValue(new Error('Delete error'));

      await notificationService.deleteToken();

      expect(mockMessaging.deleteToken).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('fcm_token');
    });
  });

  describe('Notification handlers', () => {
    it('sets up message handlers', async () => {
      mockMessaging.requestPermission.mockResolvedValue(1);
      mockMessaging.getToken.mockResolvedValue('test-token');

      await notificationService.initialize();

      expect(mockMessaging.onMessage).toHaveBeenCalled();
      expect(mockMessaging.onNotificationOpenedApp).toHaveBeenCalled();
      expect(mockMessaging.setBackgroundMessageHandler).toHaveBeenCalled();
    });

    it('handles foreground messages', async () => {
      mockMessaging.requestPermission.mockResolvedValue(1);
      mockMessaging.getToken.mockResolvedValue('test-token');

      let foregroundHandler: any;
      mockMessaging.onMessage.mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      await notificationService.initialize();

      const testMessage = {
        notification: {
          title: 'Test Title',
          body: 'Test Body',
        },
        data: {
          key: 'value',
        },
      };

      // Simulate receiving a foreground message
      foregroundHandler(testMessage);

      // Handler should be called
      expect(mockMessaging.onMessage).toHaveBeenCalled();
    });

    it('handles notification opened from background', async () => {
      mockMessaging.requestPermission.mockResolvedValue(1);
      mockMessaging.getToken.mockResolvedValue('test-token');

      let openedHandler: any;
      mockMessaging.onNotificationOpenedApp.mockImplementation((handler) => {
        openedHandler = handler;
        return jest.fn();
      });

      await notificationService.initialize();

      const testMessage = {
        notification: {
          title: 'Test Title',
          body: 'Test Body',
        },
        data: {
          screen: 'VitalData',
        },
      };

      // Simulate opening notification
      openedHandler(testMessage);

      expect(mockMessaging.onNotificationOpenedApp).toHaveBeenCalled();
    });
  });

  describe('Permission status', () => {
    it('checks permission status', async () => {
      mockMessaging.requestPermission.mockResolvedValue(1);
      
      const hasPermission = await notificationService.hasPermission();
      
      expect(mockMessaging.requestPermission).toHaveBeenCalled();
      expect(hasPermission).toBe(true);
    });
  });
});