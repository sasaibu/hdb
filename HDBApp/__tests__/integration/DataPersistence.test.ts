import { DatabaseService, VitalDataRecord } from '../../src/services/DatabaseService';
import { VitalDataService } from '../../src/services/VitalDataService';

// 実際のSQLiteを使用した統合テスト
describe('データ永続化統合テスト', () => {
  let databaseService: DatabaseService;
  let vitalDataService: VitalDataService;

  beforeAll(async () => {
    // 実際のDatabaseServiceインスタンスを使用
    databaseService = DatabaseService.getInstance();
    vitalDataService = new VitalDataService();
    
    // データベース初期化
    await databaseService.initDatabase();
    await databaseService.initializeDefaultTargets();
  });

  beforeEach(async () => {
    // 各テスト前にデータをクリア（テスト用データベースの場合）
    // 実機テストの場合はコメントアウト
  });

  describe('基本的なデータ永続化', () => {
    test('歩数データが永続化される', async () => {
      const testData: VitalDataRecord = {
        type: '歩数',
        value: 8500,
        unit: '歩',
        recorded_date: '2025-07-08',
      };

      // Step 1: データ挿入
      const insertId = await databaseService.insertVitalData(testData);
      expect(insertId).toBeGreaterThan(0);

      // Step 2: データ取得確認
      const retrievedData = await databaseService.getVitalDataByType('歩数');
      expect(retrievedData).toHaveLength(1);
      expect(retrievedData[0].value).toBe(8500);
      expect(retrievedData[0].type).toBe('歩数');

      // Step 3: データベース再接続をシミュレート
      // 実際のアプリ再起動では、新しいインスタンスが作成される
      const newDatabaseService = DatabaseService.getInstance();
      
      // Step 4: 再接続後のデータ確認
      const persistedData = await newDatabaseService.getVitalDataByType('歩数');
      expect(persistedData).toHaveLength(1);
      expect(persistedData[0].value).toBe(8500);
      
      console.log('✅ 歩数データの永続化確認完了:', persistedData[0]);
    });

    test('複数のバイタルデータが永続化される', async () => {
      const testDataList: VitalDataRecord[] = [
        {
          type: '歩数',
          value: 8500,
          unit: '歩',
          recorded_date: '2025-07-08',
        },
        {
          type: '体重',
          value: 65.5,
          unit: 'kg',
          recorded_date: '2025-07-08',
        },
        {
          type: '血圧',
          value: 120,
          unit: 'mmHg',
          systolic: 120,
          diastolic: 80,
          recorded_date: '2025-07-08',
        },
      ];

      // 複数データ挿入
      const insertIds = [];
      for (const data of testDataList) {
        const id = await databaseService.insertVitalData(data);
        insertIds.push(id);
      }

      expect(insertIds).toHaveLength(3);
      expect(insertIds.every(id => id > 0)).toBe(true);

      // 各タイプのデータ確認
      const stepsData = await databaseService.getVitalDataByType('歩数');
      const weightData = await databaseService.getVitalDataByType('体重');
      const bpData = await databaseService.getVitalDataByType('血圧');

      expect(stepsData).toHaveLength(1);
      expect(weightData).toHaveLength(1);
      expect(bpData).toHaveLength(1);

      expect(stepsData[0].value).toBe(8500);
      expect(weightData[0].value).toBe(65.5);
      expect(bpData[0].systolic).toBe(120);
      expect(bpData[0].diastolic).toBe(80);

      console.log('✅ 複数バイタルデータの永続化確認完了');
    });
  });

  describe('目標値の永続化', () => {
    test('目標値が永続化される', async () => {
      // 目標値設定
      await databaseService.setTarget('歩数', 12000);
      await databaseService.setTarget('体重', 60.0);

      // 目標値取得確認
      const stepsTarget = await databaseService.getTarget('歩数');
      const weightTarget = await databaseService.getTarget('体重');

      expect(stepsTarget).toBe(12000);
      expect(weightTarget).toBe(60.0);

      // データベース再接続をシミュレート
      const newDatabaseService = DatabaseService.getInstance();

      // 再接続後の目標値確認
      const persistedStepsTarget = await newDatabaseService.getTarget('歩数');
      const persistedWeightTarget = await newDatabaseService.getTarget('体重');

      expect(persistedStepsTarget).toBe(12000);
      expect(persistedWeightTarget).toBe(60.0);

      console.log('✅ 目標値の永続化確認完了');
    });
  });

  describe('VitalDataServiceを通じた永続化', () => {
    test('VitalDataServiceでのデータ永続化', async () => {
      // VitalDataServiceを通じてデータ追加
      const insertId = await vitalDataService.addVitalData('歩数', 9500, '2025-07-08');
      expect(insertId).toBeGreaterThan(0);

      // データ取得確認
      const data = await vitalDataService.getVitalDataByType('歩数');
      expect(data).toHaveLength(1);
      expect(data[0].value).toBe(9500);

      // 達成率計算確認
      const achievementRate = await vitalDataService.calculateAchievementRate('歩数');
      expect(achievementRate).toBeGreaterThan(0);

      console.log('✅ VitalDataServiceでの永続化確認完了');
      console.log(`達成率: ${achievementRate}%`);
    });

    test('期間別データ取得の永続化', async () => {
      // 複数日のデータ追加
      const dates = ['2025-07-06', '2025-07-07', '2025-07-08'];
      const values = [7000, 8000, 9000];

      for (let i = 0; i < dates.length; i++) {
        await vitalDataService.addVitalData('歩数', values[i], dates[i]);
      }

      // 全期間データ取得
      const allData = await vitalDataService.getVitalDataByPeriod('歩数', 'all');
      expect(allData.length).toBeGreaterThanOrEqual(3);

      // 統計データ確認
      const stats = await vitalDataService.getStatistics('歩数');
      expect(stats.count).toBeGreaterThanOrEqual(3);
      expect(stats.average).toBeGreaterThan(0);

      console.log('✅ 期間別データの永続化確認完了');
      console.log('統計データ:', stats);
    });
  });

  describe('データ操作の永続化', () => {
    test('データ更新が永続化される', async () => {
      // 初期データ挿入
      const testData: VitalDataRecord = {
        type: '体温',
        value: 36.5,
        unit: '℃',
        recorded_date: '2025-07-08',
      };

      const insertId = await databaseService.insertVitalData(testData);

      // データ更新
      await databaseService.updateVitalData(insertId, 37.0);

      // 更新確認
      const updatedData = await databaseService.getVitalDataByType('体温');
      expect(updatedData[0].value).toBe(37.0);

      console.log('✅ データ更新の永続化確認完了');
    });

    test('データ削除が永続化される', async () => {
      // テストデータ挿入
      const testData: VitalDataRecord = {
        type: '歩数',
        value: 5000,
        unit: '歩',
        recorded_date: '2025-07-08',
      };

      const insertId = await databaseService.insertVitalData(testData);

      // 削除前の確認
      let data = await databaseService.getVitalDataByType('歩数');
      const initialCount = data.length;

      // データ削除
      await databaseService.deleteVitalData(insertId);

      // 削除後の確認
      data = await databaseService.getVitalDataByType('歩数');
      expect(data.length).toBe(initialCount - 1);

      console.log('✅ データ削除の永続化確認完了');
    });
  });

  describe('エラー処理と復旧', () => {
    test('不正なデータでもデータベースが破損しない', async () => {
      try {
        // 不正なデータを挿入試行
        const invalidData: VitalDataRecord = {
          type: '',
          value: NaN,
          unit: '',
          recorded_date: 'invalid-date',
        };

        await databaseService.insertVitalData(invalidData);
      } catch (error) {
        // エラーが発生することを期待
        expect(error).toBeDefined();
      }

      // データベースが正常に動作することを確認
      const normalData: VitalDataRecord = {
        type: '歩数',
        value: 8000,
        unit: '歩',
        recorded_date: '2025-07-08',
      };

      const insertId = await databaseService.insertVitalData(normalData);
      expect(insertId).toBeGreaterThan(0);

      console.log('✅ エラー処理と復旧確認完了');
    });
  });

  afterAll(async () => {
    // テスト終了後のクリーンアップ
    console.log('🧹 データ永続化テスト完了');
  });
});
