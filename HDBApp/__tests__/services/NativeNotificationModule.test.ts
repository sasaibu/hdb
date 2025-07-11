import {NativeModules, NativeEventEmitter} from 'react-native';
import NativeNotificationModule from '../../src/services/NativeNotificationModule';

// Mock NativeModules
const mockNativeModule = {
  showNotification: jest.fn(),
  scheduleNotification: jest.fn(),
  cancelNotification: jest.fn(),
  cancelAllNotifications: jest.fn(),
  getScheduledNotifications: jest.fn(),
  requestPermissions: jest.fn(),
  checkPermissions: jest.fn(),
  setBadgeCount: jest.fn(),
  getBadgeCount: jest.fn(),
  addListener: jest.fn(),
  removeListeners: jest.fn(),
};

NativeModules.NotificationModule = mockNativeModule;

// Mock NativeEventEmitter
jest.mock('react-native', () => ({
  NativeModules: {
    NotificationModule: mockNativeModule,
  },
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
  Platform: {
    OS: 'ios',
  },
}));

describe('NativeNotificationModule', () => {
  let eventEmitter: any;

  beforeEach(() => {
    jest.clearAllMocks();
    eventEmitter = new NativeEventEmitter(mockNativeModule);
  });

  describe('Notification Display', () => {
    it('shows local notification', async () => {
      mockNativeModule.showNotification.mockResolvedValue({success: true});

      const result = await NativeNotificationModule.showNotification(
        'Test Title',
        'Test Body',
        {badge: 1, sound: 'default'}
      );

      expect(mockNativeModule.showNotification).toHaveBeenCalledWith({
        title: 'Test Title',
        body: 'Test Body',
        badge: 1,
        sound: 'default',
      });
      expect(result).toEqual({success: true});
    });

    it('handles notification display error', async () => {
      mockNativeModule.showNotification.mockRejectedValue(
        new Error('Display failed')
      );

      await expect(
        NativeNotificationModule.showNotification('Title', 'Body')
      ).rejects.toThrow('Display failed');
    });
  });

  describe('Notification Scheduling', () => {
    it('schedules notification', async () => {
      const fireDate = new Date('2025-07-12T10:00:00Z');
      mockNativeModule.scheduleNotification.mockResolvedValue({
        notificationId: 'notif-123',
      });

      const result = await NativeNotificationModule.scheduleNotification(
        'Scheduled Title',
        'Scheduled Body',
        fireDate,
        {repeatInterval: 'daily'}
      );

      expect(mockNativeModule.scheduleNotification).toHaveBeenCalledWith({
        title: 'Scheduled Title',
        body: 'Scheduled Body',
        fireDate: fireDate.toISOString(),
        repeatInterval: 'daily',
      });
      expect(result).toEqual({notificationId: 'notif-123'});
    });

    it('gets scheduled notifications', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          title: 'Notification 1',
          fireDate: '2025-07-12T10:00:00Z',
        },
        {
          id: 'notif-2',
          title: 'Notification 2',
          fireDate: '2025-07-13T10:00:00Z',
        },
      ];

      mockNativeModule.getScheduledNotifications.mockResolvedValue(
        mockNotifications
      );

      const result = await NativeNotificationModule.getScheduledNotifications();

      expect(mockNativeModule.getScheduledNotifications).toHaveBeenCalled();
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('Notification Cancellation', () => {
    it('cancels specific notification', async () => {
      mockNativeModule.cancelNotification.mockResolvedValue({success: true});

      const result = await NativeNotificationModule.cancelNotification('notif-123');

      expect(mockNativeModule.cancelNotification).toHaveBeenCalledWith('notif-123');
      expect(result).toEqual({success: true});
    });

    it('cancels all notifications', async () => {
      mockNativeModule.cancelAllNotifications.mockResolvedValue({success: true});

      const result = await NativeNotificationModule.cancelAllNotifications();

      expect(mockNativeModule.cancelAllNotifications).toHaveBeenCalled();
      expect(result).toEqual({success: true});
    });
  });

  describe('Permissions', () => {
    it('requests notification permissions', async () => {
      mockNativeModule.requestPermissions.mockResolvedValue({
        granted: true,
        alert: true,
        badge: true,
        sound: true,
      });

      const result = await NativeNotificationModule.requestPermissions({
        alert: true,
        badge: true,
        sound: true,
      });

      expect(mockNativeModule.requestPermissions).toHaveBeenCalledWith({
        alert: true,
        badge: true,
        sound: true,
      });
      expect(result.granted).toBe(true);
    });

    it('checks notification permissions', async () => {
      mockNativeModule.checkPermissions.mockResolvedValue({
        granted: false,
        alert: false,
        badge: false,
        sound: false,
      });

      const result = await NativeNotificationModule.checkPermissions();

      expect(mockNativeModule.checkPermissions).toHaveBeenCalled();
      expect(result.granted).toBe(false);
    });
  });

  describe('Badge Management', () => {
    it('sets badge count', async () => {
      mockNativeModule.setBadgeCount.mockResolvedValue({success: true});

      const result = await NativeNotificationModule.setBadgeCount(5);

      expect(mockNativeModule.setBadgeCount).toHaveBeenCalledWith(5);
      expect(result).toEqual({success: true});
    });

    it('gets badge count', async () => {
      mockNativeModule.getBadgeCount.mockResolvedValue(3);

      const result = await NativeNotificationModule.getBadgeCount();

      expect(mockNativeModule.getBadgeCount).toHaveBeenCalled();
      expect(result).toBe(3);
    });

    it('clears badge count', async () => {
      mockNativeModule.setBadgeCount.mockResolvedValue({success: true});

      const result = await NativeNotificationModule.clearBadge();

      expect(mockNativeModule.setBadgeCount).toHaveBeenCalledWith(0);
      expect(result).toEqual({success: true});
    });
  });

  describe('Event Listeners', () => {
    it('adds notification received listener', () => {
      const callback = jest.fn();
      const mockListener = {remove: jest.fn()};
      eventEmitter.addListener.mockReturnValue(mockListener);

      const listener = NativeNotificationModule.addNotificationReceivedListener(
        callback
      );

      expect(eventEmitter.addListener).toHaveBeenCalledWith(
        'NotificationReceived',
        callback
      );
      expect(listener).toBe(mockListener);
    });

    it('adds notification opened listener', () => {
      const callback = jest.fn();
      const mockListener = {remove: jest.fn()};
      eventEmitter.addListener.mockReturnValue(mockListener);

      const listener = NativeNotificationModule.addNotificationOpenedListener(
        callback
      );

      expect(eventEmitter.addListener).toHaveBeenCalledWith(
        'NotificationOpened',
        callback
      );
      expect(listener).toBe(mockListener);
    });

    it('removes all listeners', () => {
      NativeNotificationModule.removeAllListeners();

      expect(eventEmitter.removeAllListeners).toHaveBeenCalledWith(
        'NotificationReceived'
      );
      expect(eventEmitter.removeAllListeners).toHaveBeenCalledWith(
        'NotificationOpened'
      );
    });
  });

  describe('Error Handling', () => {
    it('handles missing native module', () => {
      const originalModule = NativeModules.NotificationModule;
      NativeModules.NotificationModule = undefined;

      expect(() => {
        require('../../src/services/NativeNotificationModule');
      }).toThrow();

      NativeModules.NotificationModule = originalModule;
    });

    it('handles permission request failure', async () => {
      mockNativeModule.requestPermissions.mockRejectedValue(
        new Error('Permission denied by system')
      );

      await expect(
        NativeNotificationModule.requestPermissions()
      ).rejects.toThrow('Permission denied by system');
    });
  });

  describe('Platform Specific', () => {
    it('handles Android-specific notification channels', async () => {
      // Mock Android platform
      jest.doMock('react-native', () => ({
        Platform: {OS: 'android'},
        NativeModules: {NotificationModule: mockNativeModule},
      }));

      mockNativeModule.createNotificationChannel = jest.fn().mockResolvedValue({
        success: true,
      });

      const result = await NativeNotificationModule.createNotificationChannel({
        id: 'default',
        name: 'Default Channel',
        importance: 4,
      });

      expect(mockNativeModule.createNotificationChannel).toHaveBeenCalledWith({
        id: 'default',
        name: 'Default Channel',
        importance: 4,
      });
      expect(result).toEqual({success: true});
    });
  });

  describe('Notification Actions', () => {
    it('registers notification actions', async () => {
      mockNativeModule.registerNotificationActions = jest.fn().mockResolvedValue({
        success: true,
      });

      const actions = [
        {
          id: 'accept',
          title: 'Accept',
          foreground: true,
        },
        {
          id: 'decline',
          title: 'Decline',
          destructive: true,
        },
      ];

      const result = await NativeNotificationModule.registerNotificationActions(
        actions
      );

      expect(mockNativeModule.registerNotificationActions).toHaveBeenCalledWith(
        actions
      );
      expect(result).toEqual({success: true});
    });

    it('handles action response', () => {
      const callback = jest.fn();
      const mockListener = {remove: jest.fn()};
      eventEmitter.addListener.mockReturnValue(mockListener);

      NativeNotificationModule.addNotificationActionListener(callback);

      expect(eventEmitter.addListener).toHaveBeenCalledWith(
        'NotificationActionTriggered',
        callback
      );
    });
  });
});