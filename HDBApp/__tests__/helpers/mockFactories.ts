/**
 * 高度なモックファクトリー
 * より現実的で再利用可能なモックを提供
 */

import { VitalData, User, Notification, Target } from '../../src/types';

// データベースサービスのモックファクトリー
export const createMockDatabaseService = () => {
  const mockData = {
    vitalData: [] as VitalData[],
    users: [] as User[],
    targets: [] as Target[],
  };

  return {
    initDatabase: jest.fn().mockResolvedValue(undefined),
    initializeDefaultTargets: jest.fn().mockResolvedValue(undefined),
    
    insertVitalData: jest.fn().mockImplementation((data) => {
      const id = mockData.vitalData.length + 1;
      mockData.vitalData.push({ ...data, id });
      return Promise.resolve(id);
    }),
    
    getVitalDataByType: jest.fn().mockImplementation((type, limit) => {
      const filtered = mockData.vitalData.filter(d => d.type === type);
      return Promise.resolve(limit ? filtered.slice(0, limit) : filtered);
    }),
    
    getVitalDataByTypeAndDate: jest.fn().mockImplementation((type, date) => {
      return Promise.resolve(
        mockData.vitalData.filter(d => d.type === type && d.recorded_date === date)
      );
    }),
    
    updateVitalData: jest.fn().mockImplementation((id, updates) => {
      const index = mockData.vitalData.findIndex(d => d.id === id);
      if (index !== -1) {
        mockData.vitalData[index] = { ...mockData.vitalData[index], ...updates };
      }
      return Promise.resolve();
    }),
    
    deleteVitalData: jest.fn().mockImplementation((id) => {
      mockData.vitalData = mockData.vitalData.filter(d => d.id !== id);
      return Promise.resolve();
    }),
    
    insertOrUpdateTarget: jest.fn().mockImplementation((type, value) => {
      const existing = mockData.targets.find(t => t.type === type);
      if (existing) {
        existing.target_value = value;
      } else {
        mockData.targets.push({ type, target_value: value });
      }
      return Promise.resolve();
    }),
    
    getTarget: jest.fn().mockImplementation((type) => {
      const target = mockData.targets.find(t => t.type === type);
      return Promise.resolve(target || null);
    }),
    
    executeSql: jest.fn().mockResolvedValue({ rows: { length: 0, item: jest.fn() } }),
    
    // テスト用のヘルパーメソッド
    _getMockData: () => mockData,
    _resetMockData: () => {
      mockData.vitalData = [];
      mockData.users = [];
      mockData.targets = [];
    },
  };
};

// APIクライアントのモックファクトリー
export const createMockApiClient = () => {
  const mockResponses = new Map<string, any>();
  const callHistory = new Map<string, any[]>();

  const recordCall = (method: string, args: any[]) => {
    if (!callHistory.has(method)) {
      callHistory.set(method, []);
    }
    callHistory.get(method)!.push(args);
  };

  return {
    login: jest.fn().mockImplementation((username, password) => {
      recordCall('login', [username, password]);
      const response = mockResponses.get('login') || {
        success: true,
        data: {
          token: 'mock-token-123',
          user: {
            id: 'user-001',
            username,
            displayName: 'テストユーザー',
          },
        },
      };
      return Promise.resolve(response);
    }),
    
    getUserProfile: jest.fn().mockImplementation(() => {
      recordCall('getUserProfile', []);
      const response = mockResponses.get('getUserProfile') || {
        success: true,
        data: {
          id: 'user-001',
          username: 'testuser',
          displayName: 'テストユーザー',
          email: 'test@example.com',
        },
      };
      return Promise.resolve(response);
    }),
    
    uploadVitalsBatch: jest.fn().mockImplementation((vitals) => {
      recordCall('uploadVitalsBatch', [vitals]);
      const response = mockResponses.get('uploadVitalsBatch') || {
        success: true,
        data: {
          uploadedCount: vitals.length,
          failedCount: 0,
          syncedAt: new Date().toISOString(),
          processedIds: vitals.map((v: any) => `vital-${v.localId}`),
        },
      };
      return Promise.resolve(response);
    }),
    
    getNotifications: jest.fn().mockImplementation(() => {
      recordCall('getNotifications', []);
      const response = mockResponses.get('getNotifications') || {
        success: true,
        data: [],
      };
      return Promise.resolve(response);
    }),
    
    // モック設定用のヘルパー
    _setMockResponse: (method: string, response: any) => {
      mockResponses.set(method, response);
    },
    
    _getCallHistory: (method: string) => {
      return callHistory.get(method) || [];
    },
    
    _resetHistory: () => {
      callHistory.clear();
    },
    
    _resetAll: () => {
      mockResponses.clear();
      callHistory.clear();
      jest.clearAllMocks();
    },
  };
};

// ヘルスプラットフォームサービスのモックファクトリー
export const createMockHealthPlatformService = () => {
  const mockHealthData: any[] = [];
  let isHealthKitEnabled = false;
  let isGoogleFitEnabled = false;

  return {
    initialize: jest.fn().mockResolvedValue(undefined),
    
    fetchRecentHealthData: jest.fn().mockImplementation((days = 7) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return Promise.resolve(
        mockHealthData.filter(data => new Date(data.measuredAt) >= cutoffDate)
      );
    }),
    
    setHealthKitEnabled: jest.fn().mockImplementation((enabled) => {
      isHealthKitEnabled = enabled;
    }),
    
    setGoogleFitEnabled: jest.fn().mockImplementation((enabled) => {
      isGoogleFitEnabled = enabled;
    }),
    
    // テスト用のヘルパー
    _addMockHealthData: (data: any) => {
      mockHealthData.push({
        id: `health-${mockHealthData.length + 1}`,
        measuredAt: new Date().toISOString(),
        source: 'healthkit',
        ...data,
      });
    },
    
    _clearMockData: () => {
      mockHealthData.length = 0;
    },
    
    _getEnabledStatus: () => ({
      healthKit: isHealthKitEnabled,
      googleFit: isGoogleFitEnabled,
    }),
  };
};

// 通知サービスのモックファクトリー
export const createMockNotificationService = () => {
  const notifications: Notification[] = [];
  const settings = {
    enabled: true,
    vitalDataReminder: true,
    medicationReminder: true,
    appointmentReminder: true,
    reminderTime: '09:00',
  };

  return {
    initialize: jest.fn().mockResolvedValue(undefined),
    
    checkNotificationPermission: jest.fn().mockResolvedValue(true),
    
    requestPermission: jest.fn().mockResolvedValue(true),
    
    getSettings: jest.fn().mockResolvedValue({ ...settings }),
    
    updateSettings: jest.fn().mockImplementation((updates) => {
      Object.assign(settings, updates);
      return Promise.resolve();
    }),
    
    scheduleNotification: jest.fn().mockImplementation((notification) => {
      notifications.push({
        ...notification,
        createdAt: new Date().toISOString(),
        isRead: false,
      });
      return Promise.resolve();
    }),
    
    sendImmediateNotification: jest.fn().mockImplementation((notification) => {
      notifications.push({
        ...notification,
        createdAt: new Date().toISOString(),
        isRead: false,
      });
      return Promise.resolve();
    }),
    
    getNotificationHistory: jest.fn().mockResolvedValue([...notifications]),
    
    clearNotificationHistory: jest.fn().mockImplementation(() => {
      notifications.length = 0;
      return Promise.resolve();
    }),
    
    registerForPushNotifications: jest.fn().mockResolvedValue('mock_device_token_123'),
    
    sendPushNotification: jest.fn().mockResolvedValue(undefined),
    
    // テスト用のヘルパー
    _getNotifications: () => [...notifications],
    _getSettings: () => ({ ...settings }),
    _reset: () => {
      notifications.length = 0;
      Object.assign(settings, {
        enabled: true,
        vitalDataReminder: true,
        medicationReminder: true,
        appointmentReminder: true,
        reminderTime: '09:00',
      });
    },
  };
};

// 同期サービスのモックファクトリー
export const createMockSyncService = () => {
  let isAutoSyncEnabled = false;
  let syncInterval: NodeJS.Timeout | null = null;
  const syncHistory: { timestamp: Date; result: 'success' | 'failure'; error?: string }[] = [];

  return {
    startAutoSync: jest.fn().mockImplementation(() => {
      isAutoSyncEnabled = true;
      return Promise.resolve();
    }),
    
    stopAutoSync: jest.fn().mockImplementation(() => {
      isAutoSyncEnabled = false;
      if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
      }
    }),
    
    syncNow: jest.fn().mockImplementation(() => {
      const result = {
        timestamp: new Date(),
        result: 'success' as const,
      };
      syncHistory.push(result);
      return Promise.resolve();
    }),
    
    getLastSyncTime: jest.fn().mockImplementation(() => {
      const lastSync = syncHistory[syncHistory.length - 1];
      return Promise.resolve(lastSync ? lastSync.timestamp : null);
    }),
    
    getSyncStatus: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        isAutoSyncEnabled,
        lastSyncTime: syncHistory[syncHistory.length - 1]?.timestamp || null,
        pendingCount: 0,
      });
    }),
    
    // テスト用のヘルパー
    _getSyncHistory: () => [...syncHistory],
    _simulateFailure: (error: string) => {
      syncHistory.push({
        timestamp: new Date(),
        result: 'failure',
        error,
      });
    },
    _reset: () => {
      isAutoSyncEnabled = false;
      syncHistory.length = 0;
      if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
      }
    },
  };
};

// 統合モックファクトリー
export const createIntegratedMocks = () => {
  const database = createMockDatabaseService();
  const api = createMockApiClient();
  const healthPlatform = createMockHealthPlatformService();
  const notification = createMockNotificationService();
  const sync = createMockSyncService();

  // サービス間の連携を設定
  sync.syncNow.mockImplementation(async () => {
    // データベースから未同期データを取得
    const unsyncedData = database._getMockData().vitalData.filter(
      (d: any) => d.sync_status === 'pending'
    );
    
    if (unsyncedData.length > 0) {
      // APIにアップロード
      await api.uploadVitalsBatch(unsyncedData);
      
      // 同期ステータスを更新
      unsyncedData.forEach((d: any) => {
        d.sync_status = 'synced';
      });
    }
    
    return Promise.resolve();
  });

  return {
    database,
    api,
    healthPlatform,
    notification,
    sync,
    
    // 全てのモックをリセット
    resetAll: () => {
      database._resetMockData();
      api._resetAll();
      healthPlatform._clearMockData();
      notification._reset();
      sync._reset();
      jest.clearAllMocks();
    },
  };
};