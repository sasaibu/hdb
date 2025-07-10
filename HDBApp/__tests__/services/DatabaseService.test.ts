import { DatabaseService, VitalDataRecord } from '../../src/services/DatabaseService';

// SQLiteのモック
jest.mock('react-native-sqlite-2', () => {
  let mockData: { [key: string]: any[] } = {};
  let mockTargets: { [key: string]: number } = {};
  let nextId = 1;

  // テスト間でデータをリセットする関数
  const resetMockData = () => {
    mockData = {};
    mockTargets = {};
    nextId = 1;
  };

  const mockDatabase = {
    transaction: (callback: (tx: any) => void) => {
      const mockTx = {
        executeSql: (
          sql: string,
          params: any[] = [],
          successCallback?: (tx: any, result: any) => void,
          errorCallback?: (tx: any, error: any) => boolean
        ) => {
          try {
            // CREATE TABLE処理
            if (sql.includes('CREATE TABLE')) {
              if (successCallback) successCallback(mockTx, {});
              return;
            }

            // INSERT処理
            if (sql.includes('INSERT INTO vital_data')) {
              const [type, value, unit, systolic, diastolic, recorded_date] = params;
              const newRecord = {
                id: nextId++,
                type,
                value,
                unit,
                systolic,
                diastolic,
                recorded_date,
                created_at: new Date().toISOString(),
              };
              
              if (!mockData[type]) mockData[type] = [];
              mockData[type].unshift(newRecord);
              
              if (successCallback) {
                successCallback(mockTx, { insertId: newRecord.id });
              }
              return;
            }

            // SELECT処理
            if (sql.includes('SELECT * FROM vital_data')) {
              const typeMatch = params[0];
              const data = mockData[typeMatch] || [];
              const limit = params[1];
              const resultData = limit ? data.slice(0, limit) : data;
              
              if (successCallback) {
                successCallback(mockTx, {
                  rows: {
                    length: resultData.length,
                    item: (index: number) => resultData[index],
                  },
                });
              }
              return;
            }

            // UPDATE処理
            if (sql.includes('UPDATE vital_data')) {
              const [value, systolic, diastolic, id] = params;
              for (const type in mockData) {
                const index = mockData[type].findIndex(item => item.id === id);
                if (index !== -1) {
                  mockData[type][index] = {
                    ...mockData[type][index],
                    value,
                    systolic,
                    diastolic,
                  };
                  break;
                }
              }
              if (successCallback) successCallback(mockTx, {});
              return;
            }

            // DELETE処理
            if (sql.includes('DELETE FROM vital_data')) {
              const [id] = params;
              for (const type in mockData) {
                mockData[type] = mockData[type].filter(item => item.id !== id);
              }
              if (successCallback) successCallback(mockTx, {});
              return;
            }

            // TARGET関連処理
            if (sql.includes('INSERT OR REPLACE INTO targets')) {
              const [type, targetValue] = params;
              mockTargets[type] = targetValue;
              if (successCallback) successCallback(mockTx, {});
              return;
            }

            if (sql.includes('SELECT target_value FROM targets')) {
              const [type] = params;
              const targetValue = mockTargets[type];
              if (successCallback) {
                successCallback(mockTx, {
                  rows: {
                    length: targetValue !== undefined ? 1 : 0,
                    item: () => ({ target_value: targetValue }),
                  },
                });
              }
              return;
            }

            // デフォルト成功
            if (successCallback) successCallback(mockTx, {});
          } catch (error) {
            if (errorCallback) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              errorCallback(mockTx, { message: errorMessage, code: 1 });
            }
          }
        },
      };
      callback(mockTx);
    },
  };

  return {
    openDatabase: jest.fn(() => mockDatabase),
    __resetMockData: resetMockData, // テスト用のリセット関数を公開
  };
});

describe('DatabaseService', () => {
  let databaseService: DatabaseService;

  beforeEach(() => {
    // モックデータをリセット
    const mockSQLite = require('react-native-sqlite-2');
    if (mockSQLite.__resetMockData) {
      mockSQLite.__resetMockData();
    }
    
    databaseService = DatabaseService.getInstance();
    jest.clearAllMocks();
  });

  describe('初期化', () => {
    test('データベース初期化が成功する', async () => {
      await expect(databaseService.initDatabase()).resolves.not.toThrow();
    });

    test('デフォルト目標値が設定される', async () => {
      await databaseService.initDatabase();
      await databaseService.initializeDefaultTargets();
      
      const stepsTarget = await databaseService.getTarget('歩数');
      const weightTarget = await databaseService.getTarget('体重');
      
      expect(stepsTarget).toBe(10000);
      expect(weightTarget).toBe(65.0);
    });
  });

  describe('バイタルデータ操作', () => {
    beforeEach(async () => {
      await databaseService.initDatabase();
    });

    test('バイタルデータの挿入が成功する', async () => {
      const testData: VitalDataRecord = {
        type: '歩数',
        value: 8000,
        unit: '歩',
        recorded_date: '2025-07-08',
      };

      const insertId = await databaseService.insertVitalData(testData);
      expect(insertId).toBeGreaterThan(0);
    });

    test('タイプ別データ取得が成功する', async () => {
      // テストデータ挿入
      const testData: VitalDataRecord = {
        type: '体重',
        value: 65.5,
        unit: 'kg',
        recorded_date: '2025-07-08',
      };
      
      await databaseService.insertVitalData(testData);
      
      // データ取得
      const data = await databaseService.getVitalDataByType('体重');
      
      expect(data).toHaveLength(1);
      expect(data[0].type).toBe('体重');
      expect(data[0].value).toBe(65.5);
    });

    test('データ更新が成功する', async () => {
      // テストデータ挿入
      const testData: VitalDataRecord = {
        type: '体温',
        value: 36.5,
        unit: '℃',
        recorded_date: '2025-07-08',
      };
      
      const insertId = await databaseService.insertVitalData(testData);
      
      // データ更新
      await databaseService.updateVitalData(insertId, 36.8);
      
      // 更新確認
      const data = await databaseService.getVitalDataByType('体温');
      expect(data[0].value).toBe(36.8);
    });

    test('データ削除が成功する', async () => {
      // テストデータ挿入
      const testData: VitalDataRecord = {
        type: '歩数',
        value: 9000,
        unit: '歩',
        recorded_date: '2025-07-08',
      };
      
      const insertId = await databaseService.insertVitalData(testData);
      
      // データ削除
      await databaseService.deleteVitalData(insertId);
      
      // 削除確認
      const data = await databaseService.getVitalDataByType('歩数');
      expect(data).toHaveLength(0);
    });

    test('血圧データの挿入が成功する', async () => {
      const testData: VitalDataRecord = {
        type: '血圧',
        value: 120,
        unit: 'mmHg',
        systolic: 120,
        diastolic: 80,
        recorded_date: '2025-07-08',
      };

      const insertId = await databaseService.insertVitalData(testData);
      expect(insertId).toBeGreaterThan(0);
      
      const data = await databaseService.getVitalDataByType('血圧');
      expect(data[0].systolic).toBe(120);
      expect(data[0].diastolic).toBe(80);
    });
  });

  describe('目標値管理', () => {
    beforeEach(async () => {
      await databaseService.initDatabase();
    });

    test('目標値設定が成功する', async () => {
      await databaseService.setTarget('歩数', 12000);
      const target = await databaseService.getTarget('歩数');
      expect(target).toBe(12000);
    });

    test('存在しない目標値の取得でnullが返る', async () => {
      const target = await databaseService.getTarget('存在しないタイプ');
      expect(target).toBeNull();
    });

    test('目標値の更新が成功する', async () => {
      await databaseService.setTarget('体重', 60.0);
      await databaseService.setTarget('体重', 65.0);
      
      const target = await databaseService.getTarget('体重');
      expect(target).toBe(65.0);
    });
  });

  describe('エラーハンドリング', () => {
    test('データベース未初期化時のエラー処理', async () => {
      const newService = new (DatabaseService as any)();
      
      const testData: VitalDataRecord = {
        type: '歩数',
        value: 8000,
        unit: '歩',
        recorded_date: '2025-07-08',
      };

      await expect(newService.insertVitalData(testData))
        .rejects.toThrow('Database not initialized');
    });
  });

  describe('データ制限', () => {
    beforeEach(async () => {
      await databaseService.initDatabase();
    });

    test('LIMIT付きデータ取得が正確に動作する', async () => {
      // 複数のテストデータ挿入
      for (let i = 1; i <= 5; i++) {
        await databaseService.insertVitalData({
          type: '歩数',
          value: 8000 + i * 100,
          unit: '歩',
          recorded_date: `2025-07-0${i + 2}`,
        });
      }
      
      // 制限付きで取得
      const limitedData = await databaseService.getVitalDataByType('歩数', 3);
      expect(limitedData).toHaveLength(3);
      
      // 制限なしで取得
      const allData = await databaseService.getVitalDataByType('歩数');
      expect(allData).toHaveLength(5);
    });
  });
});
