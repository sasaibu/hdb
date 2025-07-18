import { DatabaseService, VitalDataRecord } from './DatabaseService';
import { MockHealthPlatformService } from './mockHealthPlatform';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api/apiClient';

export class VitalDataService {
  private dbService: DatabaseService;
  private healthPlatformService: MockHealthPlatformService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
    this.healthPlatformService = MockHealthPlatformService.getInstance();
  }

  async initializeService(): Promise<void> {
    try {
      await this.dbService.initDatabase();
      await this.dbService.initializeDefaultTargets();
      await this.healthPlatformService.initialize();
      console.log('VitalDataService initialized successfully');
    } catch (error) {
      console.error('VitalDataService initialization failed:', error);
      throw error;
    }
  }

  // バイタルデータの追加
  async addVitalData(type: string, value: number, date?: string, systolic?: number, diastolic?: number, source: string = 'manual'): Promise<number> {
    const unit = this.getUnitByType(type);
    const recordedDate = date || new Date().toISOString().split('T')[0];

    const data: VitalDataRecord = {
      type,
      value,
      unit,
      systolic,
      diastolic,
      recorded_date: recordedDate,
      source,
    };

    const insertId = await this.dbService.insertVitalData(data);

    // 新仕様対応: 心拍数データの場合は1日集計処理を実行
    if (type === '心拍数') {
      await this.updateDailyHeartRateAggregation(recordedDate);
    }

    return insertId;
  }

  // タイプ別データ取得
  async getVitalDataByType(type: string, limit?: number): Promise<VitalDataRecord[]> {
    return await this.dbService.getVitalDataByType(type, limit);
  }

  // データ更新
  async updateVitalData(id: number, value: number, systolic?: number, diastolic?: number): Promise<void> {
    return await this.dbService.updateVitalData(id, value, systolic, diastolic);
  }

  // データ削除
  async deleteVitalData(id: number): Promise<void> {
    return await this.dbService.deleteVitalData(id);
  }

  // 目標値設定
  async setTarget(type: string, targetValue: number): Promise<void> {
    const unit = this.getUnitByType(type);
    return await this.dbService.insertOrUpdateTarget(type, targetValue, unit);
  }

  // 目標値取得
  async getTarget(type: string): Promise<any> {
    return await this.dbService.getTarget(type);
  }

  // 達成率計算
  async calculateAchievementRate(type: string): Promise<number | null> {
    try {
      const data = await this.getVitalDataByType(type, 1);
      const target = await this.getTarget(type);

      if (!data.length || !target) {
        return null;
      }

      const latestValue = data[0].value;
      const targetValue = target.target_value;

      if (!targetValue || targetValue === 0) {
        return null;
      }

      // 体重の場合は目標値に近いほど達成率が高くなるように計算
      if (type === '体重') {
        const allData = await this.getVitalDataByType(type);
        if (allData.length < 2) return 100;

        const initialValue = allData[allData.length - 1].value;
        const initialDiff = Math.abs(initialValue - targetValue);
        if (initialDiff === 0) return 100;

        const currentDiff = Math.abs(latestValue - targetValue);
        const achievementRate = Math.max(0, Math.min(100, (1 - currentDiff / initialDiff) * 100));
        return Math.round(achievementRate);
      }

      // その他の場合は目標値に対する割合
      const achievementRate = Math.min(100, (latestValue / targetValue) * 100);
      return Math.round(achievementRate);
    } catch (error) {
      console.error('Error calculating achievement rate:', error);
      return null;
    }
  }

  // 期間別データ取得
  async getVitalDataByPeriod(type: string, period: 'today' | 'week' | 'month' | 'all'): Promise<VitalDataRecord[]> {
    const allData = await this.getVitalDataByType(type);
    const now = new Date();

    switch (period) {
      case 'today':
        const today = now.toISOString().split('T')[0];
        return allData.filter(item => item.recorded_date === today);

      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        return allData.filter(item => item.recorded_date >= weekAgoStr);

      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const monthAgoStr = monthAgo.toISOString().split('T')[0];
        return allData.filter(item => item.recorded_date >= monthAgoStr);

      case 'all':
      default:
        return allData;
    }
  }

  // 統計データ取得
  async getStatistics(type: string): Promise<{
    count: number;
    average: number;
    min: number;
    max: number;
    latest: number | null;
  }> {
    const data = await this.getVitalDataByType(type);

    if (data.length === 0) {
      return {
        count: 0,
        average: 0,
        min: 0,
        max: 0,
        latest: null,
      };
    }

    const values = data.map(item => item.value);
    const sum = values.reduce((acc, val) => acc + val, 0);

    return {
      count: data.length,
      average: sum / data.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: data[0].value,
    };
  }

  // ダミーデータの挿入（テスト用）
  async insertDummyData(): Promise<void> {
    const dummyData = [
      // 歩数データ
      { type: '歩数', value: 8456, date: '2025-07-02' },
      { type: '歩数', value: 7890, date: '2025-07-01' },
      { type: '歩数', value: 9123, date: '2025-06-30' },
      
      // 体重データ
      { type: '体重', value: 65.2, date: '2025-07-02' },
      { type: '体重', value: 65.5, date: '2025-07-01' },
      { type: '体重', value: 65.4, date: '2025-06-30' },
      
      // 体温データ
      { type: '体温', value: 36.5, date: '2025-07-02' },
      { type: '体温', value: 36.6, date: '2025-07-01' },
      { type: '体温', value: 36.4, date: '2025-06-30' },
      
      // 血圧データ
      { type: '血圧', value: 120, date: '2025-07-02', systolic: 120, diastolic: 80 },
      { type: '血圧', value: 122, date: '2025-07-01', systolic: 122, diastolic: 81 },
      { type: '血圧', value: 118, date: '2025-06-30', systolic: 118, diastolic: 79 },
      
      // 心拍数データ
      { type: '心拍数', value: 72, date: '2025-07-02' },
      { type: '心拍数', value: 75, date: '2025-07-01' },
      { type: '心拍数', value: 68, date: '2025-06-30' },
      
      // 脈拍データ
      { type: '脈拍', value: 74, date: '2025-07-02' },
      { type: '脈拍', value: 77, date: '2025-07-01' },
      { type: '脈拍', value: 70, date: '2025-06-30' },
      { type: '脈拍', value: 72, date: '2025-06-29' },
      { type: '脈拍', value: 75, date: '2025-06-28' },
      { type: '脈拍', value: 73, date: '2025-06-27' },
      { type: '脈拍', value: 71, date: '2025-06-26' },
      { type: '脈拍', value: 76, date: '2025-06-25' },
      { type: '脈拍', value: 74, date: '2025-06-24' },
      { type: '脈拍', value: 73, date: '2025-06-23' },
    ];

    try {
      for (const item of dummyData) {
        await this.addVitalData(item.type, item.value, item.date, item.systolic, item.diastolic);
      }
      console.log('Dummy data inserted successfully');
    } catch (error) {
      console.error('Error inserting dummy data:', error);
      throw error;
    }
  }

  // ヘルスプラットフォームからデータを同期
  async syncHealthPlatformData(): Promise<void> {
    try {
      console.log('Starting health platform data sync...');
      
      // 過去7日間のデータを取得
      const healthData = await this.healthPlatformService.fetchRecentHealthData(7);
      
      if (healthData.length === 0) {
        console.log('No health platform data to sync');
        return;
      }

      console.log(`Syncing ${healthData.length} health records...`);
      
      // データを変換してデータベースに保存
      for (const item of healthData) {
        const typeMap: Record<string, string> = {
          steps: '歩数',
          weight: '体重',
          temperature: '体温',
          bloodPressure: '血圧',
          heartRate: '心拍数',
        };

        const type = typeMap[item.type];
        if (!type) continue;

        // 既存のデータをチェック（重複を避ける）
        const existingData = await this.dbService.getVitalDataByTypeAndDate(
          type,
          item.measuredAt.split('T')[0]
        );

        if (existingData.length === 0) {
          await this.addVitalData(
            type,
            item.value,
            item.measuredAt.split('T')[0],
            item.value2, // systolic for blood pressure
            item.type === 'bloodPressure' ? item.value : undefined, // diastolic
            item.source
          );
        }
      }

      console.log('Health platform sync completed');
    } catch (error) {
      console.error('Error syncing health platform data:', error);
      throw error;
    }
  }

  // ヘルスプラットフォームの連携状態を取得
  async getHealthPlatformStatus(): Promise<{
    healthKitEnabled: boolean;
    googleFitEnabled: boolean;
  }> {
    const healthKitEnabled = await AsyncStorage.getItem('healthkit_enabled') === 'true';
    const googleFitEnabled = await AsyncStorage.getItem('googlefit_enabled') === 'true';
    
    return {
      healthKitEnabled,
      googleFitEnabled,
    };
  }

  // バイタルAWSへのデータアップロード（同期）
  async uploadToVitalAWS(): Promise<void> {
    try {
      console.log('Starting sync to バイタルAWS...');
      
      // 未同期のデータを取得
      const unsyncedData = await this.getUnsyncedVitalData();
      
      if (unsyncedData.length === 0) {
        console.log('No unsynced data to upload');
        return;
      }

      console.log(`Found ${unsyncedData.length} unsynced records`);
      
      // データをAPI形式に変換
      const vitalsToUpload = unsyncedData.map(record => ({
        type: this.convertTypeToApiFormat(record.type),
        value: record.value,
        value2: record.diastolic, // 血圧の下の値
        unit: record.unit,
        measuredAt: `${record.recorded_date}T00:00:00Z`,
        source: record.source || 'manual',
        localId: record.id,
      }));

      // バッチアップロード
      const response = await apiClient.uploadVitalsBatch(vitalsToUpload);
      
      if (response.success) {
        console.log(`Successfully uploaded ${response.data.uploadedCount} records to バイタルAWS`);
        
        // 同期済みフラグを更新
        for (const record of unsyncedData) {
          if (record.id) {
            await this.markAsSynced(record.id);
          }
        }
        
        console.log('Sync status updated for all uploaded records');
      } else {
        console.error('Failed to upload to バイタルAWS:', response.error);
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading to バイタルAWS:', error);
      throw error;
    }
  }

  // 未同期データの取得
  private async getUnsyncedVitalData(): Promise<VitalDataRecord[]> {
    const sql = `
      SELECT * FROM vital_data 
      WHERE sync_status IS NULL OR sync_status = 'pending'
      ORDER BY recorded_date DESC
    `;
    
    try {
      const result = await this.dbService.executeSql(sql);
      const data: VitalDataRecord[] = [];
      
      for (let i = 0; i < result.rows.length; i++) {
        data.push(result.rows.item(i));
      }
      
      return data;
    } catch (error) {
      console.error('Error getting unsynced data:', error);
      return [];
    }
  }

  // 同期済みフラグの更新
  private async markAsSynced(id: number): Promise<void> {
    const sql = `
      UPDATE vital_data 
      SET sync_status = 'synced', synced_at = datetime('now')
      WHERE id = ?
    `;
    
    await this.dbService.executeSql(sql, [id]);
  }

  // 型の変換（日本語→API形式）
  private convertTypeToApiFormat(type: string): string {
    const typeMap: Record<string, string> = {
      '歩数': 'steps',
      '体重': 'weight',
      '体温': 'temperature',
      '血圧': 'bloodPressure',
      '心拍数': 'heartRate',
      '脈拍': 'pulse',
    };
    
    return typeMap[type] || type;
  }

  // 測定項目コード変換（新仕様対応）
  private convertTypeToMeasurementCode(type: string): string {
    const codeMap: Record<string, string> = {
      '歩数': 'STEPS',
      '体重': 'WEIGHT',
      '体温': 'TEMPERATURE',
      '血圧': 'BLOOD_PRESSURE',
      '心拍数': 'HEART_RATE',
      '脈拍': 'PULSE',
      'steps': 'STEPS',
      'weight': 'WEIGHT',
      'temperature': 'TEMPERATURE',
      'bloodPressure': 'BLOOD_PRESSURE',
      'heartRate': 'HEART_RATE',
      'pulse': 'PULSE',
    };
    
    return codeMap[type] || 'UNKNOWN';
  }

  // 測定項目コード→表示名変換（新仕様対応）
  private convertMeasurementCodeToDisplayName(code: string): string {
    const nameMap: Record<string, string> = {
      'STEPS': '歩数',
      'WEIGHT': '体重',
      'TEMPERATURE': '体温',
      'BLOOD_PRESSURE': '血圧',
      'HEART_RATE': '心拍数',
      'PULSE': '脈拍',
    };
    
    return nameMap[code] || code;
  }

  // タイプに応じた単位を取得
  private getUnitByType(type: string): string {
    switch (type) {
      case '歩数':
        return '歩';
      case '体重':
        return 'kg';
      case '体温':
        return '℃';
      case '血圧':
        return 'mmHg';
      case '心拍数':
        return 'bpm';
      case '脈拍':
        return 'bpm';
      default:
        return '';
    }
  }

  // データをUI表示用にフォーマット
  formatValueForDisplay(record: VitalDataRecord): string {
    if (record.type === '血圧' && record.systolic && record.diastolic) {
      return `${record.systolic}/${record.diastolic} ${record.unit}`;
    }
    
    const formattedValue = record.type === '歩数' 
      ? record.value.toLocaleString() 
      : record.value.toString();
    
    return `${formattedValue} ${record.unit}`;
  }

  // 既存のダミーデータ形式に変換（互換性のため）
  convertToLegacyFormat(records: VitalDataRecord[]): Array<{
    id: string;
    date: string;
    value: string;
  }> {
    return records.map(record => ({
      id: record.id?.toString() || '0',
      date: record.recorded_date,
      value: this.formatValueForDisplay(record),
    }));
  }

  // 新仕様対応: 1日の心拍数集計処理
  private async updateDailyHeartRateAggregation(date: string): Promise<void> {
    try {
      // 指定日の心拍数データを全て取得
      const heartRateData = await this.dbService.getVitalDataByTypeAndDate('心拍数', date);
      
      if (heartRateData.length === 0) {
        console.log(`No heart rate data found for date: ${date}`);
        return;
      }

      // 最小値・最大値を計算
      const values = heartRateData.map(record => record.value);
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);

      console.log(`Heart rate aggregation for ${date}: min=${minValue}, max=${maxValue}`);

      // 1日の心拍データテーブルに保存/更新
      await this.dbService.insertOrUpdateDailyHeartRate(date, minValue, maxValue);
      
      console.log(`Daily heart rate aggregation updated for ${date}`);
    } catch (error) {
      console.error('Error updating daily heart rate aggregation:', error);
      throw error;
    }
  }

  // 新仕様対応: 1日の心拍データ取得
  async getDailyHeartRate(date: string): Promise<any> {
    return await this.dbService.getDailyHeartRate(date);
  }

  // 新仕様対応: 期間別1日心拍データ取得
  async getDailyHeartRateByDateRange(startDate: string, endDate: string): Promise<any[]> {
    return await this.dbService.getDailyHeartRateByDateRange(startDate, endDate);
  }
}
