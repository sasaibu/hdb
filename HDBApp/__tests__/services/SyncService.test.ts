import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncService } from '../../src/services/SyncService';
import { VitalDataService } from '../../src/services/VitalDataService';

// モック
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    currentState: 'active',
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// VitalDataServiceのモック
const mockInitializeService = jest.fn().mockResolvedValue(undefined);
const mockUploadToVitalAWS = jest.fn().mockResolvedValue(undefined);

jest.mock('../../src/services/VitalDataService', () => ({
  VitalDataService: jest.fn().mockImplementation(() => ({
    initializeService: mockInitializeService,
    uploadToVitalAWS: mockUploadToVitalAWS,
  })),
}));

// タイマーのモック
jest.useFakeTimers();

// グローバル関数のモック
const mockSetInterval = jest.fn();
const mockClearInterval = jest.fn();
global.setInterval = mockSetInterval;
global.clearInterval = mockClearInterval;

describe('SyncService', () => {
  let syncService: SyncService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    syncService = SyncService.getInstance();
  });

  afterEach(() => {
    // cleanup
    syncService.cleanup();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = SyncService.getInstance();
      const instance2 = SyncService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialization', () => {
    it('should load settings from AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'auto_sync_enabled') return Promise.resolve('true');
        if (key === 'last_sync_time') return Promise.resolve('2025-07-11T10:00:00Z');
        return Promise.resolve(null);
      });

      // 初期化のための短い待機
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('auto_sync_enabled');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('last_sync_time');
      expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('setAutoSyncEnabled', () => {
    it('should enable auto sync', async () => {
      await syncService.setAutoSyncEnabled(true);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('auto_sync_enabled', 'true');
      
      // インターバルが設定されることを確認
      expect(setInterval).toHaveBeenCalled();
    });

    it('should disable auto sync', async () => {
      await syncService.setAutoSyncEnabled(false);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('auto_sync_enabled', 'false');
      
      // インターバルがクリアされることを確認
      expect(clearInterval).toHaveBeenCalled();
    });
  });

  describe('performSync', () => {
    it('should perform sync successfully', async () => {
      await syncService.performSync();

      expect(mockInitializeService).toHaveBeenCalled();
      expect(mockUploadToVitalAWS).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'last_sync_time',
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      );
    });

    it('should handle sync errors', async () => {
      mockUploadToVitalAWS.mockRejectedValueOnce(new Error('Network error'));

      await expect(syncService.performSync()).rejects.toThrow('Network error');
    });
  });

  describe('getSyncStatus', () => {
    it('should return sync status when enabled', async () => {
      await syncService.setAutoSyncEnabled(true);
      await syncService.performSync();

      const status = await syncService.getSyncStatus();

      expect(status).toMatchObject({
        enabled: true,
        lastSyncTime: expect.any(Date),
        nextSyncTime: expect.any(Date),
      });
    });

    it('should return null next sync time when disabled', async () => {
      await syncService.setAutoSyncEnabled(false);

      const status = await syncService.getSyncStatus();

      expect(status).toMatchObject({
        enabled: false,
        lastSyncTime: null,
        nextSyncTime: null,
      });
    });
  });

  describe('manualSync', () => {
    it('should trigger sync manually', async () => {
      await syncService.manualSync();

      expect(mockInitializeService).toHaveBeenCalled();
      expect(mockUploadToVitalAWS).toHaveBeenCalled();
    });
  });

  describe('auto sync interval', () => {
    it('should sync every hour when enabled', async () => {
      await syncService.setAutoSyncEnabled(true);
      
      // 初回同期
      expect(mockUploadToVitalAWS).toHaveBeenCalledTimes(1);
      
      // 1時間後
      jest.advanceTimersByTime(60 * 60 * 1000);
      
      // タイマーの実行を待つ
      await Promise.resolve();
      
      // 2回目の同期が実行されることを確認
      expect(mockUploadToVitalAWS).toHaveBeenCalledTimes(2);
    });

    it('should not sync when less than 1 hour has passed', async () => {
      await syncService.setAutoSyncEnabled(true);
      
      // 初回同期
      expect(mockUploadToVitalAWS).toHaveBeenCalledTimes(1);
      
      // 30分後
      jest.advanceTimersByTime(30 * 60 * 1000);
      
      // まだ同期されないことを確認
      expect(mockUploadToVitalAWS).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup', () => {
    it('should clean up resources', async () => {
      await syncService.setAutoSyncEnabled(true);
      
      syncService.cleanup();

      expect(clearInterval).toHaveBeenCalled();
      expect(AppState.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });
});
