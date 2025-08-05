import { DatabaseDebugger, createDatabaseDebugger } from '../../src/utils/DatabaseDebugger';
import { DatabaseService } from '../../src/services/DatabaseService';
import { VitalDataService } from '../../src/services/VitalDataService';

// Mock dependencies
jest.mock('../../src/services/DatabaseService');
jest.mock('../../src/services/VitalDataService');

const MockedDatabaseService = DatabaseService as jest.MockedClass<typeof DatabaseService>;
const MockedVitalDataService = VitalDataService as jest.MockedClass<typeof VitalDataService>;

describe('DatabaseDebugger', () => {
  let databaseDebugger: DatabaseDebugger;
  let mockDatabaseService: jest.Mocked<DatabaseService>;
  let mockVitalDataService: jest.Mocked<VitalDataService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock DatabaseService instance
    mockDatabaseService = {
      initDatabase: jest.fn(),
      getVitalDataByType: jest.fn(),
      getTarget: jest.fn(),
      insertVitalData: jest.fn(),
    } as any;

    // Mock VitalDataService instance
    mockVitalDataService = {
      calculateAchievementRate: jest.fn(),
    } as any;

    (MockedDatabaseService.getInstance as jest.Mock).mockReturnValue(mockDatabaseService);
    MockedVitalDataService.mockImplementation(() => mockVitalDataService);

    databaseDebugger = new DatabaseDebugger();
  });

  describe('constructor', () => {
    it('DatabaseServiceとVitalDataServiceのインスタンスを正しく取得する', () => {
      expect(MockedDatabaseService.getInstance).toHaveBeenCalled();
      expect(MockedVitalDataService).toHaveBeenCalled();
    });
  });

  describe('checkDatabaseStatus', () => {
    it('正常な状態でデータベース状態を返す', async () => {
      // Setup mocks
      mockDatabaseService.initDatabase.mockResolvedValue(undefined);
      mockDatabaseService.getVitalDataByType.mockImplementation((type: string) => {
        const mockData: { [key: string]: any[] } = {
          '歩数': [{ id: 1, value: 8000, unit: '歩', recorded_date: '2024-01-01' }, { id: 2, value: 9000, unit: '歩', recorded_date: '2024-01-01' }],
          '体重': [{ id: 3, value: 65.5, unit: 'kg', recorded_date: '2024-01-01' }],
          '体温': [],
          '血圧': [{ id: 4, value: 120, unit: 'mmHg', recorded_date: '2024-01-01' }],
        };
        return Promise.resolve(mockData[type] || []);
      });
      mockDatabaseService.getTarget.mockImplementation((type: string) => {
        const targets: { [key: string]: number | null } = { '歩数': 10000, '体重': 65, '体温': null, '血圧': 120 };
        return Promise.resolve(targets[type]);
      });

      const result = await databaseDebugger.checkDatabaseStatus();

      expect(result).toEqual({
        isInitialized: true,
        tablesExist: true,
        dataCount: {
          '歩数': 2,
          '体重': 1,
          '体温': 0,
          '血圧': 1,
        },
        targets: {
          '歩数': 10000,
          '体重': 65,
          '体温': null,
          '血圧': 120,
        },
      });

      expect(mockDatabaseService.initDatabase).toHaveBeenCalled();
      expect(mockDatabaseService.getVitalDataByType).toHaveBeenCalledTimes(4);
      expect(mockDatabaseService.getTarget).toHaveBeenCalledTimes(4);
    });

    it('データベース初期化エラー時にfalseを返す', async () => {
      mockDatabaseService.initDatabase.mockRejectedValue(new Error('DB init failed'));

      const result = await databaseDebugger.checkDatabaseStatus();

      expect(result).toEqual({
        isInitialized: false,
        tablesExist: false,
        dataCount: {},
        targets: {},
      });
    });

    it('個別のデータ取得エラーを適切に処理する', async () => {
      mockDatabaseService.initDatabase.mockResolvedValue(undefined);
      mockDatabaseService.getVitalDataByType.mockImplementation((type: string) => {
        if (type === '歩数') {
          return Promise.reject(new Error('Data access error'));
        }
        return Promise.resolve([]);
      });
      mockDatabaseService.getTarget.mockResolvedValue(null);

      const result = await databaseDebugger.checkDatabaseStatus();

      expect(result.dataCount['歩数']).toBe(-1);
      expect(result.targets['歩数']).toBeNull();
      expect(result.isInitialized).toBe(true);
    });
  });

  describe('insertTestData', () => {
    it('テストデータを正常に挿入する', async () => {
      mockDatabaseService.insertVitalData.mockImplementation((data) => {
        const idMap: { [key: string]: number } = { '歩数': 1, '体重': 2, '体温': 3, '血圧': 4 };
        return Promise.resolve(idMap[data.type] || 0);
      });

      const result = await databaseDebugger.insertTestData();

      expect(result.success).toBe(true);
      expect(result.insertedIds).toEqual([1, 2, 3, 4]);
      expect(result.errors).toEqual([]);
      expect(mockDatabaseService.insertVitalData).toHaveBeenCalledTimes(4);
    });

    it('一部のデータ挿入が失敗した場合を処理する', async () => {
      mockDatabaseService.insertVitalData.mockImplementation((data) => {
        if (data.type === '体重') {
          return Promise.reject(new Error('Insert failed'));
        }
        return Promise.resolve(1);
      });

      const result = await databaseDebugger.insertTestData();

      expect(result.success).toBe(false);
      expect(result.insertedIds).toEqual([1, 1, 1]); // 体重以外の3件
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to insert 体重');
    });

    it('正しいテストデータ構造で挿入を実行する', async () => {
      mockDatabaseService.insertVitalData.mockResolvedValue(1);

      await databaseDebugger.insertTestData();

      const calls = mockDatabaseService.insertVitalData.mock.calls;
      expect(calls).toHaveLength(4);

      // 歩数データの確認
      expect(calls[0][0]).toMatchObject({
        type: '歩数',
        value: 8500,
        unit: '歩',
        recorded_date: expect.any(String),
      });

      // 血圧データの確認（systolic, diastolicを含む）
      expect(calls[3][0]).toMatchObject({
        type: '血圧',
        value: 120,
        unit: 'mmHg',
        systolic: 120,
        diastolic: 80,
        recorded_date: expect.any(String),
      });
    });
  });

  describe('testDataPersistence', () => {
    it('データ永続化テストを正常に実行する', async () => {
      // Setup mocks for successful test
      mockDatabaseService.insertVitalData.mockResolvedValue(1);
      mockDatabaseService.getVitalDataByType.mockImplementation((type: string) => {
        return Promise.resolve([{ id: 1, type, value: 100, unit: 'unit', recorded_date: '2024-01-01' }]);
      });
      mockVitalDataService.calculateAchievementRate.mockResolvedValue(85);

      const result = await databaseDebugger.testDataPersistence();

      expect(result.success).toBe(true);
      expect(result.testResults).toContain('✅ Step 1 完了: 4件のデータを挿入');
      expect(result.testResults).toContain('✅ Step 2 完了: 合計4件のデータを確認');
      expect(result.testResults).toContain('✅ Step 3 完了: 歩数達成率 85%');
      expect(result.errors).toEqual([]);
    });

    it('データ挿入失敗時にエラーを返す', async () => {
      mockDatabaseService.insertVitalData.mockRejectedValue(new Error('Insert failed'));

      const result = await databaseDebugger.testDataPersistence();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('達成率計算がnullの場合を処理する', async () => {
      mockDatabaseService.insertVitalData.mockResolvedValue(1);
      mockDatabaseService.getVitalDataByType.mockResolvedValue([]);
      mockVitalDataService.calculateAchievementRate.mockResolvedValue(null);

      const result = await databaseDebugger.testDataPersistence();

      expect(result.success).toBe(true);
      expect(result.testResults).toContain('⚠️ Step 3: 達成率計算結果がnull（データまたは目標値なし）');
    });

    it('例外発生時にエラーを適切に処理する', async () => {
      mockDatabaseService.insertVitalData.mockRejectedValue(new Error('Unexpected error'));

      const result = await databaseDebugger.testDataPersistence();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Failed to insert 歩数: Error: Unexpected error');
    });
  });

  describe('getAllData', () => {
    it('全てのバイタルタイプのデータを取得する', async () => {
      mockDatabaseService.getVitalDataByType.mockImplementation((type: string) => {
        const mockData: { [key: string]: any[] } = {
          '歩数': [{ id: 1, value: 8000, unit: '歩', recorded_date: '2024-01-01' }],
          '体重': [{ id: 2, value: 65.5, unit: 'kg', recorded_date: '2024-01-01' }],
          '体温': [],
          '血圧': [{ id: 3, value: 120, unit: 'mmHg', recorded_date: '2024-01-01' }],
        };
        return Promise.resolve(mockData[type] || []);
      });

      const result = await databaseDebugger.getAllData();

      expect(result).toEqual({
        '歩数': [{ id: 1, value: 8000, unit: '歩', recorded_date: '2024-01-01' }],
        '体重': [{ id: 2, value: 65.5, unit: 'kg', recorded_date: '2024-01-01' }],
        '体温': [],
        '血圧': [{ id: 3, value: 120, unit: 'mmHg', recorded_date: '2024-01-01' }],
      });

      expect(mockDatabaseService.getVitalDataByType).toHaveBeenCalledTimes(4);
    });

    it('データ取得エラー時に空配列を返す', async () => {
      mockDatabaseService.getVitalDataByType.mockImplementation((type: string) => {
        if (type === '歩数') {
          return Promise.reject(new Error('Data access error'));
        }
        return Promise.resolve([]);
      });

      const result = await databaseDebugger.getAllData();

      expect(result['歩数']).toEqual([]);
      expect(result['体重']).toEqual([]);
    });
  });

  describe('printDebugInfo', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('デバッグ情報を正常に出力する', async () => {
      mockDatabaseService.initDatabase.mockResolvedValue(undefined);
      mockDatabaseService.getVitalDataByType.mockResolvedValue([]);
      mockDatabaseService.getTarget.mockResolvedValue(null);

      await databaseDebugger.printDebugInfo();

      expect(consoleSpy).toHaveBeenCalledWith('🔍 === データベースデバッグ情報 ===');
      expect(consoleSpy).toHaveBeenCalledWith('📊 データベース状態:', expect.any(Object));
      expect(consoleSpy).toHaveBeenCalledWith('📋 全データ:', expect.any(Object));
      expect(consoleSpy).toHaveBeenCalledWith('🔍 === デバッグ情報終了 ===');
    });

    it('エラー発生時にエラーログを出力する', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockDatabaseService.initDatabase.mockRejectedValue(new Error('Debug error'));

      await databaseDebugger.printDebugInfo();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Database status check failed:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('createDatabaseDebugger', () => {
    it('DatabaseDebuggerのインスタンスを作成する', () => {
      const instance = createDatabaseDebugger();
      expect(instance).toBeInstanceOf(DatabaseDebugger);
    });
  });

  describe('Global debugger in development', () => {
    const originalDev = __DEV__;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
      (global as any).__DEV__ = originalDev;
    });

    it('開発環境でグローバルデバッガーが設定される', () => {
      (global as any).__DEV__ = true;
      
      // Re-import to trigger the __DEV__ check
      jest.resetModules();
      require('../../src/utils/DatabaseDebugger');

      expect(consoleSpy).toHaveBeenCalledWith('🔧 Database debugger available as global.dbDebugger');
    });
  });
});
