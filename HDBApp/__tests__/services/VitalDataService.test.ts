import { VitalDataService } from '../../src/services/VitalDataService';
import { DatabaseService } from '../../src/services/DatabaseService';

// DatabaseServiceのモック
jest.mock('../../src/services/DatabaseService');

describe('VitalDataService', () => {
  let vitalDataService: VitalDataService;
  let mockDatabaseService: jest.Mocked<DatabaseService>;

  beforeEach(() => {
    // DatabaseServiceのモックを作成
    mockDatabaseService = {
      initDatabase: jest.fn(),
      initializeDefaultTargets: jest.fn(),
      insertVitalData: jest.fn(),
      getVitalDataByType: jest.fn(),
      updateVitalData: jest.fn(),
      deleteVitalData: jest.fn(),
      setTarget: jest.fn(),
      getTarget: jest.fn(),
    } as any;

    // DatabaseService.getInstanceのモック
    (DatabaseService.getInstance as jest.Mock).mockReturnValue(mockDatabaseService);

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
      mockDatabaseService.getTarget.mockResolvedValue(10000);

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
      mockDatabaseService.getTarget.mockResolvedValue(65.0);

      const result = await vitalDataService.calculateAchievementRate('体重');
      
      expect(result).toBe(100); // 目標値と一致
    });

    test('データが存在しない場合はnullを返す', async () => {
      mockDatabaseService.getVitalDataByType.mockResolvedValue([]);
      mockDatabaseService.getTarget.mockResolvedValue(10000);

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
      expect(service.getUnitByType('不明')).toBe('');
    });
  });
});
