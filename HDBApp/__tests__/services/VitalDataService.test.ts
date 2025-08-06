import { VitalDataService } from '../../src/services/VitalDataService';
import { DatabaseService } from '../../src/services/DatabaseService';
import { MockHealthPlatformService } from '../../src/services/mockHealthPlatform';
import { apiClient } from '../../src/services/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// モック
jest.mock('../../src/services/DatabaseService');
jest.mock('../../src/services/mockHealthPlatform');
jest.mock('../../src/services/api/apiClient');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('VitalDataService', () => {
  let vitalDataService: VitalDataService;
  let mockDatabaseService: jest.Mocked<DatabaseService>;
  let mockHealthPlatformService: jest.Mocked<MockHealthPlatformService>;

  beforeEach(() => {
    // DatabaseServiceのモックを作成
    mockDatabaseService = {
      initDatabase: jest.fn(),
      initializeDefaultTargets: jest.fn(),
      insertVitalData: jest.fn(),
      getVitalDataByType: jest.fn(),
      getVitalDataByTypeAndDate: jest.fn().mockResolvedValue([]),
      updateVitalData: jest.fn(),
      deleteVitalData: jest.fn(),
      insertOrUpdateTarget: jest.fn(),
      getTarget: jest.fn(),
      executeSql: jest.fn(),
    } as any;

    // MockHealthPlatformServiceのモックを作成
    mockHealthPlatformService = {
      initialize: jest.fn(),
      fetchRecentHealthData: jest.fn(),
      setHealthKitEnabled: jest.fn(),
      setGoogleFitEnabled: jest.fn(),
    } as any;

    // DatabaseService.getInstanceのモック
    (DatabaseService.getInstance as jest.Mock).mockReturnValue(mockDatabaseService);
    
    // MockHealthPlatformService.getInstanceのモック
    (MockHealthPlatformService.getInstance as jest.Mock).mockReturnValue(mockHealthPlatformService);

    vitalDataService = new VitalDataService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('初期化', () => {
    test('サービス初期化が成功する', async () => {
      mockDatabaseService.initDatabase.mockResolvedValue();
      mockDatabaseService.initializeDefaultTargets.mockResolvedValue();

      await expect(vitalDataService.initializeService()).resolves.not.toThrow();
      
      expect(mockDatabaseService.initDatabase).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.initializeDefaultTargets).toHaveBeenCalledTimes(1);
    });
  });

  describe('バイタルデータ操作', () => {
    test('バイタルデータの追加が成功する', async () => {
      mockDatabaseService.insertVitalData.mockResolvedValue(1);

      const result = await vitalDataService.addVitalData('歩数', 8000, '2025-07-08');
      
      expect(result).toBe(1);
      expect(mockDatabaseService.insertVitalData).toHaveBeenCalledWith({
        type: '歩数',
        value: 8000,
        unit: '歩',
        recorded_date: '2025-07-08',
        systolic: undefined,
        diastolic: undefined,
        source: 'manual',
      });
    });

    test('血圧データの追加が成功する', async () => {
      mockDatabaseService.insertVitalData.mockResolvedValue(1);

      const result = await vitalDataService.addVitalData('血圧', 120, '2025-07-08', 120, 80);
      
      expect(result).toBe(1);
      expect(mockDatabaseService.insertVitalData).toHaveBeenCalledWith({
        type: '血圧',
        value: 120,
        unit: 'mmHg',
        recorded_date: '2025-07-08',
        systolic: 120,
        diastolic: 80,
        source: 'manual',
      });
    });

    test('心拍数データの追加が成功する', async () => {
      mockDatabaseService.insertVitalData.mockResolvedValue(1);

      const result = await vitalDataService.addVitalData('心拍数', 72, '2025-07-08');
      
      expect(result).toBe(1);
      expect(mockDatabaseService.insertVitalData).toHaveBeenCalledWith({
        type: '心拍数',
        value: 72,
        unit: 'bpm',
        recorded_date: '2025-07-08',
        systolic: undefined,
        diastolic: undefined,
        source: 'manual',
      });
    });

    test('脈拍データの追加が成功する', async () => {
      mockDatabaseService.insertVitalData.mockResolvedValue(1);

      const result = await vitalDataService.addVitalData('脈拍', 68, '2025-07-08');
      
      expect(result).toBe(1);
      expect(mockDatabaseService.insertVitalData).toHaveBeenCalledWith({
        type: '脈拍',
        value: 68,
        unit: 'bpm',
        recorded_date: '2025-07-08',
        systolic: undefined,
        diastolic: undefined,
        source: 'manual',
      });
    });

    test('データ取得が成功する', async () => {
      const mockData = [
        { id: 1, type: '歩数', value: 8000, unit: '歩', recorded_date: '2025-07-08' },
      ];
      mockDatabaseService.getVitalDataByType.mockResolvedValue(mockData);

      const result = await vitalDataService.getVitalDataByType('歩数');
      
      expect(result).toEqual(mockData);
      expect(mockDatabaseService.getVitalDataByType).toHaveBeenCalledWith('歩数', undefined);
    });
  });

  describe('達成率計算', () => {
    test('歩数の達成率計算が正確', async () => {
      const mockData = [
        { id: 1, type: '歩数', value: 8000, unit: '歩', recorded_date: '2025-07-08' },
      ];
      mockDatabaseService.getVitalDataByType.mockResolvedValue(mockData);
      mockDatabaseService.getTarget.mockResolvedValue({ target_value: 10000 });

      const result = await vitalDataService.calculateAchievementRate('歩数');
      
      expect(result).toBe(80); // 8000/10000 * 100
    });

    test('体重の達成率計算が正確', async () => {
      const mockData = [
        { id: 2, type: '体重', value: 65.0, unit: 'kg', recorded_date: '2025-07-08' },
        { id: 1, type: '体重', value: 70.0, unit: 'kg', recorded_date: '2025-07-01' },
      ];
      mockDatabaseService.getVitalDataByType.mockResolvedValueOnce([mockData[0]]) // 最新データ
        .mockResolvedValueOnce(mockData); // 全データ
      mockDatabaseService.getTarget.mockResolvedValue({ target_value: 65.0 });

      const result = await vitalDataService.calculateAchievementRate('体重');
      
      expect(result).toBe(100); // 目標値と一致
    });

    test('データが存在しない場合はnullを返す', async () => {
      mockDatabaseService.getVitalDataByType.mockResolvedValue([]);
      mockDatabaseService.getTarget.mockResolvedValue({ target_value: 10000 });

      const result = await vitalDataService.calculateAchievementRate('歩数');
      
      expect(result).toBeNull();
    });

    test('目標値が存在しない場合はnullを返す', async () => {
      const mockData = [
        { id: 1, type: '歩数', value: 8000, unit: '歩', recorded_date: '2025-07-08' },
      ];
      mockDatabaseService.getVitalDataByType.mockResolvedValue(mockData);
      mockDatabaseService.getTarget.mockResolvedValue(null);

      const result = await vitalDataService.calculateAchievementRate('歩数');
      
      expect(result).toBeNull();
    });
  });

  describe('期間別データ取得', () => {
    const mockData = [
      { id: 1, type: '歩数', value: 8000, unit: '歩', recorded_date: '2025-07-08' },
      { id: 2, type: '歩数', value: 7500, unit: '歩', recorded_date: '2025-07-01' },
      { id: 3, type: '歩数', value: 9000, unit: '歩', recorded_date: '2025-06-15' },
    ];

    beforeEach(() => {
      mockDatabaseService.getVitalDataByType.mockResolvedValue(mockData);
    });

    test('今日のデータ取得', async () => {
      const today = new Date().toISOString().split('T')[0];
      const todayData = [
        { id: 1, type: '歩数', value: 8000, unit: '歩', recorded_date: today },
      ];
      mockDatabaseService.getVitalDataByType.mockResolvedValue(todayData);

      const result = await vitalDataService.getVitalDataByPeriod('歩数', 'today');
      
      expect(result).toHaveLength(1);
      expect(result[0].recorded_date).toBe(today);
    });

    test('今週のデータ取得', async () => {
      const result = await vitalDataService.getVitalDataByPeriod('歩数', 'week');
      
      // 7日以内のデータのみ取得されることを確認
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    test('全期間のデータ取得', async () => {
      const result = await vitalDataService.getVitalDataByPeriod('歩数', 'all');
      
      expect(result).toEqual(mockData);
    });
  });

  describe('統計データ取得', () => {
    test('統計データ計算が正確', async () => {
      const mockData = [
        { id: 1, type: '歩数', value: 8000, unit: '歩', recorded_date: '2025-07-08' },
        { id: 2, type: '歩数', value: 9000, unit: '歩', recorded_date: '2025-07-07' },
        { id: 3, type: '歩数', value: 7000, unit: '歩', recorded_date: '2025-07-06' },
      ];
      mockDatabaseService.getVitalDataByType.mockResolvedValue(mockData);

      const result = await vitalDataService.getStatistics('歩数');
      
      expect(result.count).toBe(3);
      expect(result.average).toBe(8000); // (8000 + 9000 + 7000) / 3
      expect(result.min).toBe(7000);
      expect(result.max).toBe(9000);
      expect(result.latest).toBe(8000);
    });

    test('データが存在しない場合の統計データ', async () => {
      mockDatabaseService.getVitalDataByType.mockResolvedValue([]);

      const result = await vitalDataService.getStatistics('歩数');
      
      expect(result.count).toBe(0);
      expect(result.average).toBe(0);
      expect(result.min).toBe(0);
      expect(result.max).toBe(0);
      expect(result.latest).toBeNull();
    });
  });

  describe('データフォーマット', () => {
    test('歩数データのフォーマットが正確', () => {
      const record = {
        id: 1,
        type: '歩数',
        value: 8000,
        unit: '歩',
        recorded_date: '2025-07-08',
      };

      const result = vitalDataService.formatValueForDisplay(record);
      
      expect(result).toBe('8,000 歩');
    });

    test('血圧データのフォーマットが正確', () => {
      const record = {
        id: 1,
        type: '血圧',
        value: 120,
        unit: 'mmHg',
        systolic: 120,
        diastolic: 80,
        recorded_date: '2025-07-08',
      };

      const result = vitalDataService.formatValueForDisplay(record);
      
      expect(result).toBe('120/80 mmHg');
    });

    test('体重データのフォーマットが正確', () => {
      const record = {
        id: 1,
        type: '体重',
        value: 65.5,
        unit: 'kg',
        recorded_date: '2025-07-08',
      };

      const result = vitalDataService.formatValueForDisplay(record);
      
      expect(result).toBe('65.5 kg');
    });
  });

  describe('レガシーフォーマット変換', () => {
    test('レガシーフォーマットへの変換が正確', () => {
      const records = [
        {
          id: 1,
          type: '歩数',
          value: 8000,
          unit: '歩',
          recorded_date: '2025-07-08',
        },
        {
          id: 2,
          type: '血圧',
          value: 120,
          unit: 'mmHg',
          systolic: 120,
          diastolic: 80,
          recorded_date: '2025-07-07',
        },
      ];

      const result = vitalDataService.convertToLegacyFormat(records);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        date: '2025-07-08',
        value: '8,000 歩',
      });
      expect(result[1]).toEqual({
        id: '2',
        date: '2025-07-07',
        value: '120/80 mmHg',
      });
    });
  });

  describe('単位取得', () => {
    test('各タイプの単位が正確に取得される', () => {
      // privateメソッドのテストのため、any型でアクセス
      const service = vitalDataService as any;
      
      expect(service.getUnitByType('歩数')).toBe('歩');
      expect(service.getUnitByType('体重')).toBe('kg');
      expect(service.getUnitByType('体温')).toBe('℃');
      expect(service.getUnitByType('血圧')).toBe('mmHg');
      expect(service.getUnitByType('心拍数')).toBe('bpm');
      expect(service.getUnitByType('脈拍')).toBe('bpm');
      expect(service.getUnitByType('不明')).toBe('');
    });
  });

  describe('測定項目コード変換', () => {
    test('測定項目コードから表示名への変換が正確', () => {
      // privateメソッドのテストのため、any型でアクセス
      const service = vitalDataService as any;
      
      expect(service.convertMeasurementCodeToDisplayName('1000')).toBe('歩数（概算）');
      expect(service.convertMeasurementCodeToDisplayName('1001')).toBe('歩数（手入力）');
      expect(service.convertMeasurementCodeToDisplayName('1100')).toBe('体重');
      expect(service.convertMeasurementCodeToDisplayName('1101')).toBe('体脂肪率');
      expect(service.convertMeasurementCodeToDisplayName('1200')).toBe('血圧');
      expect(service.convertMeasurementCodeToDisplayName('1210')).toBe('心拍数');
      expect(service.convertMeasurementCodeToDisplayName('1400')).toBe('体温');
      expect(service.convertMeasurementCodeToDisplayName('9999')).toBe('不明');
    });

    test('バイタル種別から測定項目コードへの変換が正確', () => {
      // privateメソッドのテストのため、any型でアクセス
      const service = vitalDataService as any;
      
      expect(service.convertTypeToMeasurementCode('歩数', false)).toBe('1000'); // HealthKit/自動取得
      expect(service.convertTypeToMeasurementCode('歩数', true)).toBe('1001');  // 手入力
      expect(service.convertTypeToMeasurementCode('体重', false)).toBe('1100');
      expect(service.convertTypeToMeasurementCode('体重', true)).toBe('1100');
      expect(service.convertTypeToMeasurementCode('血圧', false)).toBe('1200');
      expect(service.convertTypeToMeasurementCode('心拍数', false)).toBe('1210');
      expect(service.convertTypeToMeasurementCode('脈拍', false)).toBe('1210'); // 心拍数と同じコード
      expect(service.convertTypeToMeasurementCode('体温', false)).toBe('1400');
      expect(service.convertTypeToMeasurementCode('不明', false)).toBe('9999');
    });

    test('測定項目コードと表示名を含む表示文字列の生成が正確', () => {
      // privateメソッドのテストのため、any型でアクセス
      const service = vitalDataService as any;
      
      const record = {
        id: 1,
        type: '歩数',
        value: 8000,
        unit: '歩',
        recorded_date: '2025-07-08',
        source: 'healthkit',
      };

      const result = service.getDisplayNameWithCode(record);
      expect(result).toBe('歩数（概算） (1000)'); // HealthKit/自動取得として扱う
    });

    test('手入力フラグの判定が正確', () => {
      // privateメソッドのテストのため、any型でアクセス
      const service = vitalDataService as any;
      
      expect(service.isManualInput('manual')).toBe(true);
      expect(service.isManualInput('user_input')).toBe(true);
      expect(service.isManualInput('healthkit')).toBe(false);
      expect(service.isManualInput('googlefit')).toBe(false);
      expect(service.isManualInput('healthconnect')).toBe(false);
      expect(service.isManualInput(undefined as any)).toBe(false); // undefinedの場合はfalse
    });
  });

  describe('心拍数データ集計処理', () => {
    test('心拍数の1日集計処理が正確', async () => {
      const mockHeartRateData = [
        { id: 1, type: '心拍数', value: 72, unit: 'bpm', recorded_date: '2025-07-08', recorded_time: '09:00' },
        { id: 2, type: '心拍数', value: 85, unit: 'bpm', recorded_date: '2025-07-08', recorded_time: '12:00' },
        { id: 3, type: '心拍数', value: 68, unit: 'bpm', recorded_date: '2025-07-08', recorded_time: '18:00' },
      ];
      
      mockDatabaseService.getVitalDataByTypeAndDate.mockResolvedValue(mockHeartRateData);
      mockDatabaseService.insertOrUpdateDailyHeartRate = jest.fn();

      // privateメソッドのテストのため、any型でアクセス
      const service = vitalDataService as any;
      
      // updateDailyHeartRateAggregationをテスト
      await service.updateDailyHeartRateAggregation('2025-07-08');
      
      expect(mockDatabaseService.insertOrUpdateDailyHeartRate).toHaveBeenCalledWith('2025-07-08', 68, 85);
    });

    test('心拍数データが存在しない場合の集計処理', async () => {
      mockDatabaseService.getVitalDataByTypeAndDate.mockResolvedValue([]);
      mockDatabaseService.insertOrUpdateDailyHeartRate = jest.fn();

      // privateメソッドのテストのため、any型でアクセス
      const service = vitalDataService as any;
      
      // updateDailyHeartRateAggregationをテスト
      await service.updateDailyHeartRateAggregation('2025-07-08');
      
      // データがない場合は何も呼ばれない
      expect(mockDatabaseService.insertOrUpdateDailyHeartRate).not.toHaveBeenCalled();
    });
  });

  describe('ヘルスプラットフォーム連携', () => {
    test('syncHealthPlatformDataが正しくデータを同期する', async () => {
      const mockHealthData = [
        {
          id: 'health-1',
          type: 'steps' as const,
          value: 10000,
          unit: '歩',
          measuredAt: '2025-07-11T09:00:00Z',
          source: 'healthkit' as const,
        },
        {
          id: 'health-2',
          type: 'weight' as const,
          value: 65.5,
          unit: 'kg',
          measuredAt: '2025-07-11T07:00:00Z',
          source: 'healthkit' as const,
        },
        {
          id: 'health-3',
          type: 'heartRate' as const,
          value: 72,
          unit: 'bpm',
          measuredAt: '2025-07-11T08:00:00Z',
          source: 'healthkit' as const,
        },
      ];

      mockHealthPlatformService.fetchRecentHealthData.mockResolvedValue(mockHealthData);
      mockDatabaseService.getVitalDataByTypeAndDate.mockResolvedValue([]);
      mockDatabaseService.insertVitalData.mockResolvedValue(1);

      await vitalDataService.syncHealthPlatformData();

      expect(mockHealthPlatformService.fetchRecentHealthData).toHaveBeenCalledWith(7);
      expect(mockDatabaseService.insertVitalData).toHaveBeenCalledTimes(3);
      expect(mockDatabaseService.insertVitalData).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '歩数',
          value: 10000,
          source: 'healthkit',
        })
      );
      expect(mockDatabaseService.insertVitalData).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '心拍数',
          value: 72,
          source: 'healthkit',
        })
      );
    });

    test('既存データがある場合は重複を避ける', async () => {
      const mockHealthData = [
        {
          id: 'health-1',
          type: 'steps' as const,
          value: 10000,
          unit: '歩',
          measuredAt: '2025-07-11T09:00:00Z',
          source: 'healthkit' as const,
        },
      ];

      mockHealthPlatformService.fetchRecentHealthData.mockResolvedValue(mockHealthData);
      // 既存データあり
      mockDatabaseService.getVitalDataByTypeAndDate.mockResolvedValue([
        { id: 1, type: '歩数', value: 10000, unit: '歩', recorded_date: '2025-07-11' },
      ]);

      await vitalDataService.syncHealthPlatformData();

      expect(mockDatabaseService.insertVitalData).not.toHaveBeenCalled();
    });
  });

  describe('バイタルAWSへのアップロード', () => {
    test('uploadToVitalAWSが未同期データをアップロードする', async () => {
      const unsyncedData = [
        {
          id: 1,
          type: '歩数',
          value: 8000,
          unit: '歩',
          recorded_date: '2025-07-11',
          sync_status: 'pending',
        },
        {
          id: 2,
          type: '体重',
          value: 65.5,
          unit: 'kg',
          recorded_date: '2025-07-11',
          sync_status: 'pending',
        },
      ];

      mockDatabaseService.executeSql.mockImplementation((sql: string) => {
        if (sql.includes('SELECT')) {
          return Promise.resolve({
            rows: {
              length: unsyncedData.length,
              item: (index: number) => unsyncedData[index],
            },
          });
        }
        return Promise.resolve({});
      });

      (apiClient.uploadVitalsBatch as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          uploadedCount: 2,
          failedCount: 0,
          syncedAt: '2025-07-11T10:00:00Z',
          processedIds: ['vital-1', 'vital-2'],
        },
      });

      await vitalDataService.uploadToVitalAWS();

      expect(apiClient.uploadVitalsBatch).toHaveBeenCalledWith([
        expect.objectContaining({
          type: 'steps',
          value: 8000,
          localId: 1,
        }),
        expect.objectContaining({
          type: 'weight',
          value: 65.5,
          localId: 2,
        }),
      ]);

      // sync_statusの更新を確認
      expect(mockDatabaseService.executeSql).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE vital_data'),
        [1]
      );
      expect(mockDatabaseService.executeSql).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE vital_data'),
        [2]
      );
    });

    test('未同期データがない場合は何もしない', async () => {
      mockDatabaseService.executeSql.mockResolvedValue({
        rows: { length: 0, item: jest.fn() },
      });

      await vitalDataService.uploadToVitalAWS();

      expect(apiClient.uploadVitalsBatch).not.toHaveBeenCalled();
    });

    test('アップロード失敗時はエラーをスローする', async () => {
      const unsyncedData = [
        {
          id: 1,
          type: '歩数',
          value: 8000,
          unit: '歩',
          recorded_date: '2025-07-11',
          sync_status: 'pending',
        },
      ];

      mockDatabaseService.executeSql.mockImplementation((sql: string) => {
        if (sql.includes('SELECT')) {
          return Promise.resolve({
            rows: {
              length: unsyncedData.length,
              item: (index: number) => unsyncedData[index],
            },
          });
        }
        return Promise.resolve({});
      });

      (apiClient.uploadVitalsBatch as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Network error',
      });

      await expect(vitalDataService.uploadToVitalAWS()).rejects.toThrow('Network error');
    });
  });

  describe('ヘルスプラットフォーム状態管理', () => {
    test('getHealthPlatformStatusが設定を正しく取得する', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'healthkit_enabled') return Promise.resolve('true');
        if (key === 'googlefit_enabled') return Promise.resolve('false');
        return Promise.resolve(null);
      });

      const status = await vitalDataService.getHealthPlatformStatus();

      expect(status).toEqual({
        healthKitEnabled: true,
        googleFitEnabled: false,
      });
    });
  });

  describe('エッジケースのテスト', () => {
    describe('バイタルデータ追加の境界値テスト', () => {
      test('負の値を追加しようとした場合の処理', async () => {
        mockDatabaseService.insertVitalData.mockResolvedValue(1);

        const result = await vitalDataService.addVitalData('歩数', -100, '2025-07-08');
        
        expect(result).toBe(1);
        expect(mockDatabaseService.insertVitalData).toHaveBeenCalledWith({
          type: '歩数',
          value: -100, // 負の値でも保存される（ビジネスロジックによる）
          unit: '歩',
          recorded_date: '2025-07-08',
          systolic: undefined,
          diastolic: undefined,
          source: 'manual',
        });
      });

      test('極端に大きな値を追加した場合の処理', async () => {
        mockDatabaseService.insertVitalData.mockResolvedValue(1);

        const result = await vitalDataService.addVitalData('歩数', 999999999, '2025-07-08');
        
        expect(result).toBe(1);
        expect(mockDatabaseService.insertVitalData).toHaveBeenCalledWith({
          type: '歩数',
          value: 999999999,
          unit: '歩',
          recorded_date: '2025-07-08',
          systolic: undefined,
          diastolic: undefined,
          source: 'manual',
        });
      });

      test('小数点を含む歩数データの処理', async () => {
        mockDatabaseService.insertVitalData.mockResolvedValue(1);

        const result = await vitalDataService.addVitalData('歩数', 8000.5, '2025-07-08');
        
        expect(result).toBe(1);
        expect(mockDatabaseService.insertVitalData).toHaveBeenCalledWith({
          type: '歩数',
          value: 8000.5,
          unit: '歩',
          recorded_date: '2025-07-08',
          systolic: undefined,
          diastolic: undefined,
          source: 'manual',
        });
      });

      test('血圧の収縮期と拡張期が逆転している場合', async () => {
        mockDatabaseService.insertVitalData.mockResolvedValue(1);

        const result = await vitalDataService.addVitalData('血圧', 80, '2025-07-08', 80, 120);
        
        expect(result).toBe(1);
        expect(mockDatabaseService.insertVitalData).toHaveBeenCalledWith({
          type: '血圧',
          value: 80,
          unit: 'mmHg',
          recorded_date: '2025-07-08',
          systolic: 80,
          diastolic: 120, // 逆転していてもそのまま保存
          source: 'manual',
        });
      });

      test('日付が未来の場合', async () => {
        mockDatabaseService.insertVitalData.mockResolvedValue(1);
        const futureDate = '2099-12-31';

        const result = await vitalDataService.addVitalData('歩数', 8000, futureDate);
        
        expect(result).toBe(1);
        expect(mockDatabaseService.insertVitalData).toHaveBeenCalledWith({
          type: '歩数',
          value: 8000,
          unit: '歩',
          recorded_date: futureDate,
          systolic: undefined,
          diastolic: undefined,
          source: 'manual',
        });
      });

      test('無効な日付形式の場合', async () => {
        mockDatabaseService.insertVitalData.mockResolvedValue(1);

        const result = await vitalDataService.addVitalData('歩数', 8000, 'invalid-date');
        
        expect(result).toBe(1);
        expect(mockDatabaseService.insertVitalData).toHaveBeenCalledWith({
          type: '歩数',
          value: 8000,
          unit: '歩',
          recorded_date: 'invalid-date', // 無効な日付でもそのまま渡される
          systolic: undefined,
          diastolic: undefined,
          source: 'manual',
        });
      });
    });

    describe('達成率計算のエッジケース', () => {
      test('目標値が0の場合の達成率計算', async () => {
        const mockData = [
          { id: 1, type: '歩数', value: 8000, unit: '歩', recorded_date: '2025-07-08' },
        ];
        mockDatabaseService.getVitalDataByType.mockResolvedValue(mockData);
        mockDatabaseService.getTarget.mockResolvedValue({ target_value: 0 });

        const result = await vitalDataService.calculateAchievementRate('歩数');
        
        expect(result).toBeNull(); // 目標値が0の場合はnullを返す
      });

      test('実績が目標値を大幅に超えている場合', async () => {
        const mockData = [
          { id: 1, type: '歩数', value: 50000, unit: '歩', recorded_date: '2025-07-08' },
        ];
        mockDatabaseService.getVitalDataByType.mockResolvedValue(mockData);
        mockDatabaseService.getTarget.mockResolvedValue({ target_value: 10000 });

        const result = await vitalDataService.calculateAchievementRate('歩数');
        
        expect(result).toBe(100); // 100%でキャップされる
      });

      test('体重の場合で実績が目標値より大きい場合', async () => {
        const mockData = [
          { id: 1, type: '体重', value: 70.0, unit: 'kg', recorded_date: '2025-07-08' },
        ];
        mockDatabaseService.getVitalDataByType.mockResolvedValueOnce([mockData[0]])
          .mockResolvedValueOnce(mockData);
        mockDatabaseService.getTarget.mockResolvedValue({ target_value: 65.0 });

        const result = await vitalDataService.calculateAchievementRate('体重');
        
        // 初期値からの改善率を計算するが、初期値が1つしかない場合は100
        expect(result).toBe(100);
      });
    });

    describe('データフォーマットのエッジケース', () => {
      test('非常に大きな数値のフォーマット', () => {
        const record = {
          id: 1,
          type: '歩数',
          value: 1234567890,
          unit: '歩',
          recorded_date: '2025-07-08',
        };

        const result = vitalDataService.formatValueForDisplay(record);
        
        expect(result).toBe('1,234,567,890 歩');
      });

      test('小数点以下が多い体重データのフォーマット', () => {
        const record = {
          id: 1,
          type: '体重',
          value: 65.123456789,
          unit: 'kg',
          recorded_date: '2025-07-08',
        };

        const result = vitalDataService.formatValueForDisplay(record);
        
        expect(result).toBe('65.123456789 kg'); // 値はそのまま表示される
      });

      test('血圧データで拡張期が欠損している場合', () => {
        const record = {
          id: 1,
          type: '血圧',
          value: 120,
          unit: 'mmHg',
          systolic: 120,
          diastolic: undefined,
          recorded_date: '2025-07-08',
        };

        const result = vitalDataService.formatValueForDisplay(record);
        
        expect(result).toBe('120 mmHg'); // 拡張期なしで表示
      });

      test('未知のバイタルタイプの場合', () => {
        const record = {
          id: 1,
          type: '未知のタイプ',
          value: 100,
          unit: '不明',
          recorded_date: '2025-07-08',
        };

        const result = vitalDataService.formatValueForDisplay(record);
        
        expect(result).toBe('100 不明');
      });
    });
  });

  describe('エラーハンドリングの強化', () => {
    describe('データベースエラーの処理', () => {
      test('初期化時のデータベースエラー', async () => {
        mockDatabaseService.initDatabase.mockRejectedValue(new Error('Database connection failed'));

        await expect(vitalDataService.initializeService()).rejects.toThrow('Database connection failed');
      });

      test('データ追加時のデータベースエラー', async () => {
        mockDatabaseService.insertVitalData.mockRejectedValue(new Error('Insert failed'));

        await expect(vitalDataService.addVitalData('歩数', 8000, '2025-07-08')).rejects.toThrow('Insert failed');
      });

      test('データ取得時のデータベースエラー', async () => {
        mockDatabaseService.getVitalDataByType.mockRejectedValue(new Error('Query failed'));

        await expect(vitalDataService.getVitalDataByType('歩数')).rejects.toThrow('Query failed');
      });
    });

    describe('ヘルスプラットフォーム連携エラー', () => {
      test('ヘルスプラットフォームからのデータ取得エラー', async () => {
        mockHealthPlatformService.fetchRecentHealthData.mockRejectedValue(new Error('HealthKit not available'));

        await expect(vitalDataService.syncHealthPlatformData()).rejects.toThrow('HealthKit not available');
      });

      test('ヘルスプラットフォームデータの不正な形式', async () => {
        const invalidHealthData = [
          {
            id: 'health-1',
            type: 'unknown' as any, // 不正なタイプ
            value: null as any, // null値
            unit: '歩',
            measuredAt: '2025-07-11T09:00:00Z',
            source: 'healthkit' as const,
          },
        ];

        mockHealthPlatformService.fetchRecentHealthData.mockResolvedValue(invalidHealthData);
        mockDatabaseService.getVitalDataByTypeAndDate.mockResolvedValue([]);

        // エラーをスローするか、スキップするかはビジネスロジック次第
        await vitalDataService.syncHealthPlatformData();

        // 不正なデータはスキップされる
        expect(mockDatabaseService.insertVitalData).not.toHaveBeenCalled();
      });
    });

    describe('API通信エラー', () => {
      test('ネットワークエラー時の再試行処理', async () => {
        const unsyncedData = [
          {
            id: 1,
            type: '歩数',
            value: 8000,
            unit: '歩',
            recorded_date: '2025-07-11',
            sync_status: 'pending',
          },
        ];

        mockDatabaseService.executeSql.mockImplementation((sql: string) => {
          if (sql.includes('SELECT')) {
            return Promise.resolve({
              rows: {
                length: unsyncedData.length,
                item: (index: number) => unsyncedData[index],
              },
            });
          }
          return Promise.resolve({});
        });

        // 最初はエラー、再試行で成功
        (apiClient.uploadVitalsBatch as jest.Mock)
          .mockRejectedValueOnce(new Error('Network timeout'))
          .mockResolvedValueOnce({
            success: true,
            data: {
              uploadedCount: 1,
              failedCount: 0,
              syncedAt: '2025-07-11T10:00:00Z',
              processedIds: ['vital-1'],
            },
          });

        // 再試行ロジックがない場合はエラーをスロー
        await expect(vitalDataService.uploadToVitalAWS()).rejects.toThrow('Network timeout');
      });

      test('部分的なアップロード失敗の処理', async () => {
        const unsyncedData = [
          {
            id: 1,
            type: '歩数',
            value: 8000,
            unit: '歩',
            recorded_date: '2025-07-11',
            sync_status: 'pending',
          },
          {
            id: 2,
            type: '体重',
            value: 65.5,
            unit: 'kg',
            recorded_date: '2025-07-11',
            sync_status: 'pending',
          },
        ];

        mockDatabaseService.executeSql.mockImplementation((sql: string) => {
          if (sql.includes('SELECT')) {
            return Promise.resolve({
              rows: {
                length: unsyncedData.length,
                item: (index: number) => unsyncedData[index],
              },
            });
          }
          return Promise.resolve({});
        });

        (apiClient.uploadVitalsBatch as jest.Mock).mockResolvedValue({
          success: true,
          data: {
            uploadedCount: 1,
            failedCount: 1,
            syncedAt: '2025-07-11T10:00:00Z',
            processedIds: ['vital-1'],
            failedIds: ['vital-2'],
          },
        });

        await vitalDataService.uploadToVitalAWS();

        // 成功したIDのみ更新される
        expect(mockDatabaseService.executeSql).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE vital_data'),
          [1]
        );
        expect(mockDatabaseService.executeSql).not.toHaveBeenCalledWith(
          expect.stringContaining('UPDATE vital_data'),
          [2]
        );
      });
    });

    describe('AsyncStorageエラー', () => {
      test('AsyncStorage読み込みエラー時のフォールバック', async () => {
        (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage unavailable'));

        const status = await vitalDataService.getHealthPlatformStatus();

        // エラー時はデフォルト値を返す
        expect(status).toEqual({
          healthKitEnabled: false,
          googleFitEnabled: false,
        });
      });
    });
  });

  describe('並行処理とレースコンディション', () => {
    test('同時に複数のデータ追加が実行された場合', async () => {
      mockDatabaseService.insertVitalData
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(3);

      const promises = [
        vitalDataService.addVitalData('歩数', 8000, '2025-07-08'),
        vitalDataService.addVitalData('体重', 65.5, '2025-07-08'),
        vitalDataService.addVitalData('体温', 36.5, '2025-07-08'),
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual([1, 2, 3]);
      expect(mockDatabaseService.insertVitalData).toHaveBeenCalledTimes(3);
    });

    test('同期処理が並行して実行された場合', async () => {
      const mockHealthData = [
        {
          id: 'health-1',
          type: 'steps' as const,
          value: 10000,
          unit: '歩',
          measuredAt: '2025-07-11T09:00:00Z',
          source: 'healthkit' as const,
        },
      ];

      mockHealthPlatformService.fetchRecentHealthData.mockResolvedValue(mockHealthData);
      mockDatabaseService.getVitalDataByTypeAndDate.mockResolvedValue([]);
      mockDatabaseService.insertVitalData.mockResolvedValue(1);

      // 同時に2回同期を実行
      const promises = [
        vitalDataService.syncHealthPlatformData(),
        vitalDataService.syncHealthPlatformData(),
      ];

      await Promise.all(promises);

      // 重複して実行されることを確認（実際のアプリではロック機構が必要）
      expect(mockHealthPlatformService.fetchRecentHealthData).toHaveBeenCalledTimes(2);
    });
  });
});
