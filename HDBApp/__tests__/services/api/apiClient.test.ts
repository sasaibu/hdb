import { apiClient, API_CONFIG } from '../../../src/services/api/apiClient';
import { mockApi } from '../../../src/services/api/mockApi';

// Mock fetch for RealApiClient tests
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock mockApi
jest.mock('../../../src/services/api/mockApi');
const mockApiMocked = mockApi as jest.Mocked<typeof mockApi>;

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Factory Pattern', () => {
    it('USE_MOCKがtrueの場合、mockApiを返す', () => {
      // API_CONFIG.USE_MOCKはデフォルトでtrueなので、mockApiが返される
      expect(apiClient).toBe(mockApi);
    });
  });

  describe('Mock API Integration', () => {
    it('login メソッドが正常に動作する', async () => {
      const mockResponse = { success: true, data: { token: 'test-token' } };
      mockApiMocked.login.mockResolvedValue(mockResponse);

      const result = await apiClient.login('testuser', 'password');

      expect(mockApiMocked.login).toHaveBeenCalledWith('testuser', 'password');
      expect(result).toEqual(mockResponse);
    });

    it('getVitals メソッドが正常に動作する', async () => {
      const mockResponse = { success: true, data: [] };
      mockApiMocked.getVitals.mockResolvedValue(mockResponse);

      const result = await apiClient.getVitals();

      expect(mockApiMocked.getVitals).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('createVital メソッドが正常に動作する', async () => {
      const vitalData = {
        type: 'weight',
        value: 65.5,
        unit: 'kg',
        measuredAt: '2024-01-01T00:00:00Z',
      };
      const mockResponse = { success: true, data: { id: '1', ...vitalData } };
      mockApiMocked.createVital.mockResolvedValue(mockResponse);

      const result = await apiClient.createVital(vitalData);

      expect(mockApiMocked.createVital).toHaveBeenCalledWith(vitalData);
      expect(result).toEqual(mockResponse);
    });

    it('updateProfile メソッドが正常に動作する', async () => {
      const updates = { name: 'Updated Name' };
      const mockResponse = { success: true, data: updates };
      mockApiMocked.updateProfile.mockResolvedValue(mockResponse);

      const result = await apiClient.updateProfile(updates);

      expect(mockApiMocked.updateProfile).toHaveBeenCalledWith(updates);
      expect(result).toEqual(mockResponse);
    });

    it('getRankings メソッドが正常に動作する', async () => {
      const mockResponse = { success: true, data: [] };
      mockApiMocked.getRankings.mockResolvedValue(mockResponse);

      const result = await apiClient.getRankings('steps');

      expect(mockApiMocked.getRankings).toHaveBeenCalledWith('steps');
      expect(result).toEqual(mockResponse);
    });

    it('uploadVitalsBatch メソッドが正常に動作する', async () => {
      const vitals = [
        { type: 'weight', value: 65.5 },
        { type: 'steps', value: 10000 },
      ];
      const mockResponse = { success: true, data: { processed: 2 } };
      mockApiMocked.uploadVitalsBatch.mockResolvedValue(mockResponse);

      const result = await apiClient.uploadVitalsBatch(vitals);

      expect(mockApiMocked.uploadVitalsBatch).toHaveBeenCalledWith(vitals);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('API呼び出しでエラーが発生した場合、エラーが伝播される', async () => {
      const error = new Error('Network error');
      mockApiMocked.login.mockRejectedValue(error);

      await expect(apiClient.login('user', 'pass')).rejects.toThrow('Network error');
    });

    it('各メソッドでエラーハンドリングが適切に動作する', async () => {
      const methods = [
        { method: 'logout', args: [] },
        { method: 'verifyToken', args: [] },
        { method: 'getProfile', args: [] },
        { method: 'getVitalSummary', args: [] },
        { method: 'getNotifications', args: [] },
        { method: 'createBackup', args: [] },
      ];

      for (const { method, args } of methods) {
        const error = new Error(`${method} error`);
        (mockApiMocked as any)[method].mockRejectedValue(error);

        await expect((apiClient as any)[method](...args)).rejects.toThrow(`${method} error`);
      }
    });
  });

  describe('Method Coverage', () => {
    it('全ての認証メソッドが実装されている', () => {
      expect(typeof apiClient.login).toBe('function');
      expect(typeof apiClient.logout).toBe('function');
      expect(typeof apiClient.verifyToken).toBe('function');
    });

    it('全てのユーザーメソッドが実装されている', () => {
      expect(typeof apiClient.getProfile).toBe('function');
      expect(typeof apiClient.updateProfile).toBe('function');
    });

    it('全てのバイタルデータメソッドが実装されている', () => {
      expect(typeof apiClient.getVitals).toBe('function');
      expect(typeof apiClient.createVital).toBe('function');
      expect(typeof apiClient.updateVital).toBe('function');
      expect(typeof apiClient.deleteVital).toBe('function');
      expect(typeof apiClient.getVitalSummary).toBe('function');
    });

    it('全ての通知メソッドが実装されている', () => {
      expect(typeof apiClient.getNotifications).toBe('function');
      expect(typeof apiClient.markNotificationAsRead).toBe('function');
    });

    it('全てのデバイスメソッドが実装されている', () => {
      expect(typeof apiClient.registerDevice).toBe('function');
      expect(typeof apiClient.updateDevice).toBe('function');
      expect(typeof apiClient.updatePushToken).toBe('function');
    });

    it('全ての同期メソッドが実装されている', () => {
      expect(typeof apiClient.createBackup).toBe('function');
      expect(typeof apiClient.restoreBackup).toBe('function');
      expect(typeof apiClient.uploadVitalsBatch).toBe('function');
    });

    it('全ての移行メソッドが実装されている', () => {
      expect(typeof apiClient.migrationAuth).toBe('function');
      expect(typeof apiClient.executeMigration).toBe('function');
    });

    it('全てのランキングメソッドが実装されている', () => {
      expect(typeof apiClient.getRankings).toBe('function');
    });
  });

  describe('API Configuration', () => {
    it('API_CONFIGが正しく設定されている', () => {
      expect(API_CONFIG).toHaveProperty('USE_MOCK');
      expect(API_CONFIG).toHaveProperty('BASE_URL');
      expect(API_CONFIG).toHaveProperty('TIMEOUT');
      expect(typeof API_CONFIG.USE_MOCK).toBe('boolean');
      expect(typeof API_CONFIG.BASE_URL).toBe('string');
      expect(typeof API_CONFIG.TIMEOUT).toBe('number');
    });

    it('デフォルト設定が適切である', () => {
      expect(API_CONFIG.USE_MOCK).toBe(true);
      expect(API_CONFIG.BASE_URL).toBe('https://api.hdb.example.com');
      expect(API_CONFIG.TIMEOUT).toBe(30000);
    });
  });

  describe('Method Parameters', () => {
    it('パラメータ付きメソッドが正常に動作する', async () => {
      const mockResponse = { success: true };

      // getVitals with parameters
      mockApiMocked.getVitals.mockResolvedValue(mockResponse);
      await apiClient.getVitals({ limit: 10, offset: 0 });
      expect(mockApiMocked.getVitals).toHaveBeenCalledWith({ limit: 10, offset: 0 });

      // updateVital with id and updates
      mockApiMocked.updateVital.mockResolvedValue(mockResponse);
      await apiClient.updateVital('123', { value: 70 });
      expect(mockApiMocked.updateVital).toHaveBeenCalledWith('123', { value: 70 });

      // deleteVital with id
      mockApiMocked.deleteVital.mockResolvedValue(mockResponse);
      await apiClient.deleteVital('123');
      expect(mockApiMocked.deleteVital).toHaveBeenCalledWith('123');

      // markNotificationAsRead with id
      mockApiMocked.markNotificationAsRead.mockResolvedValue(mockResponse);
      await apiClient.markNotificationAsRead('456');
      expect(mockApiMocked.markNotificationAsRead).toHaveBeenCalledWith('456');

      // updateDevice with id and updates
      mockApiMocked.updateDevice.mockResolvedValue(mockResponse);
      await apiClient.updateDevice('device1', { name: 'New Name' });
      expect(mockApiMocked.updateDevice).toHaveBeenCalledWith('device1', { name: 'New Name' });

      // updatePushToken with deviceId and token
      mockApiMocked.updatePushToken.mockResolvedValue(mockResponse);
      await apiClient.updatePushToken('device1', 'token123');
      expect(mockApiMocked.updatePushToken).toHaveBeenCalledWith('device1', 'token123');

      // restoreBackup with backupId
      mockApiMocked.restoreBackup.mockResolvedValue(mockResponse);
      await apiClient.restoreBackup('backup1');
      expect(mockApiMocked.restoreBackup).toHaveBeenCalledWith('backup1');

      // migrationAuth with credentials
      mockApiMocked.migrationAuth.mockResolvedValue(mockResponse);
      await apiClient.migrationAuth('user', 'pass');
      expect(mockApiMocked.migrationAuth).toHaveBeenCalledWith('user', 'pass');

      // executeMigration with token
      mockApiMocked.executeMigration.mockResolvedValue(mockResponse);
      await apiClient.executeMigration('migration-token');
      expect(mockApiMocked.executeMigration).toHaveBeenCalledWith('migration-token');
    });
  });
});
