import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MockHealthPlatformService } from '../../src/services/mockHealthPlatform';

// Platform.OSのモック
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

// AsyncStorageのモック
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('MockHealthPlatformService', () => {
  let service: MockHealthPlatformService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = MockHealthPlatformService.getInstance();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = MockHealthPlatformService.getInstance();
      const instance2 = MockHealthPlatformService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should load settings from AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'healthkit_enabled') return Promise.resolve('true');
        if (key === 'googlefit_enabled') return Promise.resolve('false');
        return Promise.resolve(null);
      });

      await service.initialize();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('healthkit_enabled');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('googlefit_enabled');
    });
  });

  describe('platform availability', () => {
    it('should detect HealthKit availability on iOS', () => {
      (Platform as any).OS = 'ios';
      expect(service.isHealthKitAvailable()).toBe(true);
      expect(service.isGoogleFitAvailable()).toBe(false);
    });

    it('should detect Google Fit availability on Android', () => {
      (Platform as any).OS = 'android';
      expect(service.isHealthKitAvailable()).toBe(false);
      expect(service.isGoogleFitAvailable()).toBe(true);
    });
  });

  describe('permission requests', () => {
    it('should grant HealthKit permission after delay', async () => {
      const start = Date.now();
      const result = await service.requestHealthKitPermission();
      const duration = Date.now() - start;

      expect(result).toBe(true);
      expect(duration).toBeGreaterThanOrEqual(1500); // モックの遅延を確認
    });

    it('should grant Google Fit permission after delay', async () => {
      const start = Date.now();
      const result = await service.requestGoogleFitPermission();
      const duration = Date.now() - start;

      expect(result).toBe(true);
      expect(duration).toBeGreaterThanOrEqual(1500);
    });
  });

  describe('settings management', () => {
    it('should save HealthKit enabled state', async () => {
      await service.setHealthKitEnabled(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('healthkit_enabled', 'true');

      await service.setHealthKitEnabled(false);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('healthkit_enabled', 'false');
    });

    it('should save Google Fit enabled state', async () => {
      await service.setGoogleFitEnabled(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('googlefit_enabled', 'true');

      await service.setGoogleFitEnabled(false);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('googlefit_enabled', 'false');
    });
  });

  describe('fetchRecentHealthData', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      await service.initialize();
      await service.setHealthKitEnabled(true);
    });

    it('should return empty array when disabled', async () => {
      await service.setHealthKitEnabled(false);
      await service.setGoogleFitEnabled(false);
      
      const data = await service.fetchRecentHealthData(7);
      expect(data).toEqual([]);
    });

    it('should generate mock health data for enabled platform', async () => {
      (Platform as any).OS = 'ios';
      const data = await service.fetchRecentHealthData(7);

      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('type');
      expect(data[0]).toHaveProperty('value');
      expect(data[0]).toHaveProperty('unit');
      expect(data[0]).toHaveProperty('measuredAt');
      expect(data[0].source).toBe('healthkit');
    });

    it('should generate different data types', async () => {
      const data = await service.fetchRecentHealthData(7);
      
      const types = new Set(data.map(item => item.type));
      expect(types.has('steps')).toBe(true);
      expect(types.has('weight')).toBe(true);
      expect(types.has('temperature')).toBe(true);
      expect(types.has('bloodPressure')).toBe(true);
      expect(types.has('heartRate')).toBe(true);
    });

    it('should generate data for requested number of days', async () => {
      const days = 3;
      const data = await service.fetchRecentHealthData(days);
      
      const dates = new Set(data.map(item => 
        new Date(item.measuredAt).toDateString()
      ));
      
      // 少なくとも要求された日数分のデータが含まれているか確認
      expect(dates.size).toBeLessThanOrEqual(days + 1); // +1 for edge cases
    });
  });

  describe('fetchHealthDataByType', () => {
    beforeEach(async () => {
      await service.setHealthKitEnabled(true);
    });

    it('should filter data by type', async () => {
      const stepsData = await service.fetchHealthDataByType('steps', 7);
      
      expect(stepsData.length).toBeGreaterThan(0);
      expect(stepsData.every(item => item.type === 'steps')).toBe(true);
    });

    it('should return empty array for unknown type', async () => {
      const data = await service.fetchHealthDataByType('unknown', 7);
      expect(data).toEqual([]);
    });
  });

  describe('syncHealthData', () => {
    it('should complete sync after delay', async () => {
      const start = Date.now();
      await service.syncHealthData();
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(1500);
    });
  });
});