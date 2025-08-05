import { NativeModules } from 'react-native';

describe('NativeNotificationModule', () => {
  // Setup mock before all tests
  const mockNotificationModule = {
    showNotification: jest.fn(),
    scheduleNotification: jest.fn(),
    cancelNotification: jest.fn(),
    cancelAllNotifications: jest.fn(),
    getScheduledNotifications: jest.fn(),
    requestPermissions: jest.fn(),
    checkPermissions: jest.fn(),
    setBadgeCount: jest.fn(),
    getBadgeCount: jest.fn(),
  };

  beforeAll(() => {
    // Mock NativeModules with our notification module
    (NativeModules as any).NotificationModule = mockNotificationModule;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Notification Display', () => {
    it('shows local notification', async () => {
      mockNotificationModule.showNotification.mockImplementation((notification) => {
        // Simulate native module behavior
      });

      NativeModules.NotificationModule.showNotification({
        title: 'Test Title',
        body: 'Test Body',
        id: 1,
      });

      expect(mockNotificationModule.showNotification).toHaveBeenCalledWith({
        title: 'Test Title',
        body: 'Test Body',
        id: 1,
      });
    });

    it('handles notification display error', async () => {
      mockNotificationModule.showNotification.mockImplementation(() => {
        throw new Error('Display failed');
      });

      expect(() => {
        NativeModules.NotificationModule.showNotification({
          title: 'Title',
          body: 'Body',
        });
      }).toThrow('Display failed');
    });
  });

  describe('Notification Permissions', () => {
    it('requests permissions on iOS', async () => {
      mockNotificationModule.requestPermissions.mockResolvedValue({
        alert: true,
        badge: true,
        sound: true,
      });

      const result = await NativeModules.NotificationModule.requestPermissions();

      expect(mockNotificationModule.requestPermissions).toHaveBeenCalled();
      expect(result).toEqual({
        alert: true,
        badge: true,
        sound: true,
      });
    });

    it('checks current permissions', async () => {
      mockNotificationModule.checkPermissions.mockResolvedValue({
        alert: true,
        badge: false,
        sound: true,
      });

      const result = await NativeModules.NotificationModule.checkPermissions();

      expect(mockNotificationModule.checkPermissions).toHaveBeenCalled();
      expect(result).toEqual({
        alert: true,
        badge: false,
        sound: true,
      });
    });
  });

  describe('Badge Management', () => {
    it('sets badge count', async () => {
      mockNotificationModule.setBadgeCount.mockResolvedValue({ success: true });

      const result = await NativeModules.NotificationModule.setBadgeCount(5);

      expect(mockNotificationModule.setBadgeCount).toHaveBeenCalledWith(5);
      expect(result).toEqual({ success: true });
    });

    it('gets current badge count', async () => {
      mockNotificationModule.getBadgeCount.mockResolvedValue(3);

      const result = await NativeModules.NotificationModule.getBadgeCount();

      expect(mockNotificationModule.getBadgeCount).toHaveBeenCalled();
      expect(result).toBe(3);
    });

    it('clears badge count', async () => {
      mockNotificationModule.setBadgeCount.mockResolvedValue({ success: true });

      const result = await NativeModules.NotificationModule.setBadgeCount(0);

      expect(mockNotificationModule.setBadgeCount).toHaveBeenCalledWith(0);
      expect(result).toEqual({ success: true });
    });
  });
});