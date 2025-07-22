import { DatabaseService } from '../services/DatabaseService';
import { VitalDataService } from '../services/VitalDataService';

export class DatabaseDebugger {
  private databaseService: DatabaseService;
  private vitalDataService: VitalDataService;

  constructor() {
    this.databaseService = DatabaseService.getInstance();
    this.vitalDataService = new VitalDataService();
  }

  /**
   * データベースの状態を確認
   */
  async checkDatabaseStatus(): Promise<{
    isInitialized: boolean;
    tablesExist: boolean;
    dataCount: { [key: string]: number };
    targets: { [key: string]: number | null };
  }> {
    try {
      // データベース初期化確認
      await this.databaseService.initDatabase();
      
      // 各タイプのデータ数を取得
      const vitalTypes = ['歩数', '体重', '体温', '血圧'];
      const dataCount: { [key: string]: number } = {};
      const targets: { [key: string]: number | null } = {};

      for (const type of vitalTypes) {
        try {
          const data = await this.databaseService.getVitalDataByType(type);
          dataCount[type] = data.length;
          
          const target = await this.databaseService.getTarget(type);
          targets[type] = target;
        } catch (error) {
          console.error(`Error getting data for ${type}:`, error);
          dataCount[type] = -1; // エラーを示す
          targets[type] = null;
        }
      }

      return {
        isInitialized: true,
        tablesExist: true,
        dataCount,
        targets,
      };
    } catch (error) {
      console.error('Database status check failed:', error);
      return {
        isInitialized: false,
        tablesExist: false,
        dataCount: {},
        targets: {},
      };
    }
  }

  /**
   * テストデータを挿入
   */
  async insertTestData(): Promise<{
    success: boolean;
    insertedIds: number[];
    errors: string[];
  }> {
    const testData = [
      {
        type: '歩数',
        value: 8500,
        unit: '歩',
        recorded_date: new Date().toISOString().split('T')[0],
      },
      {
        type: '体重',
        value: 65.5,
        unit: 'kg',
        recorded_date: new Date().toISOString().split('T')[0],
      },
      {
        type: '体温',
        value: 36.5,
        unit: '℃',
        recorded_date: new Date().toISOString().split('T')[0],
      },
      {
        type: '血圧',
        value: 120,
        unit: 'mmHg',
        systolic: 120,
        diastolic: 80,
        recorded_date: new Date().toISOString().split('T')[0],
      },
    ];

    const insertedIds: number[] = [];
    const errors: string[] = [];

    for (const data of testData) {
      try {
        const id = await this.databaseService.insertVitalData(data);
        insertedIds.push(id);
        console.log(`✅ Test data inserted: ${data.type} = ${data.value}${data.unit}, ID: ${id}`);
      } catch (error) {
        const errorMessage = `Failed to insert ${data.type}: ${error}`;
        errors.push(errorMessage);
        console.error('❌', errorMessage);
      }
    }

    return {
      success: errors.length === 0,
      insertedIds,
      errors,
    };
  }

  /**
   * データ永続化テスト
   */
  async testDataPersistence(): Promise<{
    success: boolean;
    testResults: string[];
    errors: string[];
  }> {
    const testResults: string[] = [];
    const errors: string[] = [];

    try {
      // Step 1: テストデータ挿入
      testResults.push('🔄 Step 1: テストデータ挿入中...');
      const insertResult = await this.insertTestData();
      
      if (!insertResult.success) {
        errors.push(...insertResult.errors);
        return { success: false, testResults, errors };
      }

      testResults.push(`✅ Step 1 完了: ${insertResult.insertedIds.length}件のデータを挿入`);

      // Step 2: データ取得確認
      testResults.push('🔄 Step 2: データ取得確認中...');
      const allData = await this.getAllData();
      
      let totalCount = 0;
      for (const [type, data] of Object.entries(allData)) {
        totalCount += data.length;
        testResults.push(`  - ${type}: ${data.length}件`);
      }

      testResults.push(`✅ Step 2 完了: 合計${totalCount}件のデータを確認`);

      // Step 3: 達成率計算テスト
      testResults.push('🔄 Step 3: 達成率計算テスト中...');
      const achievementRate = await this.vitalDataService.calculateAchievementRate('歩数');
      
      if (achievementRate !== null) {
        testResults.push(`✅ Step 3 完了: 歩数達成率 ${achievementRate}%`);
      } else {
        testResults.push('⚠️ Step 3: 達成率計算結果がnull（データまたは目標値なし）');
      }

      return {
        success: true,
        testResults,
        errors,
      };

    } catch (error) {
      errors.push(`Persistence test failed: ${error}`);
      return {
        success: false,
        testResults,
        errors,
      };
    }
  }

  /**
   * 全データを表示
   */
  async getAllData(): Promise<{
    [key: string]: any[];
  }> {
    const vitalTypes = ['歩数', '体重', '体温', '血圧'];
    const allData: { [key: string]: any[] } = {};

    for (const type of vitalTypes) {
      try {
        const data = await this.databaseService.getVitalDataByType(type);
        allData[type] = data;
      } catch (error) {
        console.error(`Error getting all data for ${type}:`, error);
        allData[type] = [];
      }
    }

    return allData;
  }

  /**
   * デバッグ情報を出力
   */
  async printDebugInfo(): Promise<void> {
    console.log('🔍 === データベースデバッグ情報 ===');
    
    try {
      const status = await this.checkDatabaseStatus();
      console.log('📊 データベース状態:', status);

      const allData = await this.getAllData();
      console.log('📋 全データ:', allData);

      console.log('🔍 === デバッグ情報終了 ===');
    } catch (error) {
      console.error('❌ デバッグ情報取得エラー:', error);
    }
  }
}

// デバッグ用のグローバル関数をエクスポート
export const createDatabaseDebugger = () => new DatabaseDebugger();

// 開発環境でのみ使用するグローバルデバッガー
if (__DEV__) {
  (global as any).dbDebugger = createDatabaseDebugger();
  console.log('🔧 Database debugger available as global.dbDebugger');
}
