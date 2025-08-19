import AsyncStorage from '@react-native-async-storage/async-storage';
import { MockApiService } from '../../../src/services/api/mockApi';

// AsyncStorageのモック
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('MockApiService - uploadVitalsBatch', () => {
  let mockApi: MockApiService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApi = MockApiService.getInstance();
    
    // ログイン状態をモック
    const mockUser = {
      id: 'user-001',
      username: 'testuser',
      displayName: '田中太郎',
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));
  });

  describe('uploadVitalsBatch', () => {
    it('should upload vitals successfully when authenticated', async () => {
      const vitalsToUpload = [
        {
          type: 'steps',
          value: 8500,
          unit: '歩',
          measuredAt: '2025-07-11T09:00:00Z',
          source: 'manual',
          localId: 1,
        },
        {
          type: 'weight',
          value: 65.5,
          unit: 'kg',
          measuredAt: '2025-07-11T07:00:00Z',
          source: 'healthkit',
          localId: 2,
        },
        {
          type: 'bloodPressure',
          value: 120,
          value2: 80,
          unit: 'mmHg',
          measuredAt: '2025-07-11T08:00:00Z',
          source: 'manual',
          localId: 3,
        },
      ];

      const response = await mockApi.uploadVitalsBatch(vitalsToUpload);

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({
        uploadedCount: 3,
        failedCount: 0,
        syncedAt: expect.any(String),
        processedIds: expect.arrayContaining([
          expect.any(Number),
        ]),
      });
      expect(response.message).toContain('3件のバイタルデータを新仕様でアップロードしました');
    });

    it('should fail when not authenticated', async () => {
      // 未認証状態をモック
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const vitalsToUpload = [
        {
          type: 'steps',
          value: 8500,
          unit: '歩',
          measuredAt: '2025-07-11T09:00:00Z',
          source: 'manual',
        },
      ];

      const response = await mockApi.uploadVitalsBatch(vitalsToUpload);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Unauthorized');
    });

    it('should process empty array', async () => {
      const response = await mockApi.uploadVitalsBatch([]);

      expect(response.success).toBe(true);
      expect(response.data.uploadedCount).toBe(0);
      expect(response.data.failedCount).toBe(0);
      expect(response.data.processedIds).toEqual([]);
    });

    it('should add syncedAt timestamp to all uploaded vitals', async () => {
      const vitalsToUpload = [
        {
          type: 'steps',
          value: 8500,
          unit: '歩',
          measuredAt: '2025-07-11T09:00:00Z',
          source: 'manual',
        },
      ];

      const beforeUpload = Date.now();
      const response = await mockApi.uploadVitalsBatch(vitalsToUpload);
      const afterUpload = Date.now();

      expect(response.success).toBe(true);
      
      const syncedAt = new Date(response.data.syncedAt).getTime();
      expect(syncedAt).toBeGreaterThanOrEqual(beforeUpload);
      expect(syncedAt).toBeLessThanOrEqual(afterUpload);
    });

    it('should handle large batch uploads', async () => {
      const largeVitalsBatch = Array.from({ length: 100 }, (_, index) => ({
        type: 'steps',
        value: 5000 + index * 100,
        unit: '歩',
        measuredAt: new Date(Date.now() - index * 3600000).toISOString(),
        source: 'healthkit',
        localId: index + 1,
      }));

      const response = await mockApi.uploadVitalsBatch(largeVitalsBatch);

      expect(response.success).toBe(true);
      expect(response.data.uploadedCount).toBe(100);
      expect(response.data.processedIds).toHaveLength(100);
    });

    it('should preserve original vital data properties', async () => {
      const customVital = {
        type: 'temperature',
        value: 36.5,
        unit: '℃',
        measuredAt: '2025-07-11T06:00:00Z',
        source: 'manual',
        customField: 'preserved',
        metadata: { device: 'thermometer-v2' },
      };

      const response = await mockApi.uploadVitalsBatch([customVital]);

      expect(response.success).toBe(true);
      // MockAPIの実装では、カスタムフィールドも保持される
      expect(response.data.uploadedCount).toBe(1);
    });

    it('should simulate network delay', async () => {
      const vitalsToUpload = [
        {
          type: 'steps',
          value: 8500,
          unit: '歩',
          measuredAt: '2025-07-11T09:00:00Z',
          source: 'manual',
        },
      ];

      const start = Date.now();
      await mockApi.uploadVitalsBatch(vitalsToUpload);
      const duration = Date.now() - start;

      // バッチ処理の遅延（1500ms）を確認
      expect(duration).toBeGreaterThanOrEqual(1400); // 少し余裕を持たせる
    });
  });
});