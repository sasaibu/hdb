import { DatabaseService, VitalDataRecord } from './DatabaseService';

export class VitalDataService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  async initializeService(): Promise<void> {
    try {
      await this.dbService.initDatabase();
      await this.dbService.initializeDefaultTargets();
      console.log('VitalDataService initialized successfully');
    } catch (error) {
      console.error('VitalDataService initialization failed:', error);
      throw error;
    }
  }

  // バイタルデータの追加
  async addVitalData(type: string, value: number, date?: string, systolic?: number, diastolic?: number): Promise<number> {
    const unit = this.getUnitByType(type);
    const recordedDate = date || new Date().toISOString().split('T')[0];

    const data: VitalDataRecord = {
      type,
      value,
      unit,
      systolic,
      diastolic,
      recorded_date: recordedDate,
    };

    return await this.dbService.insertVitalData(data);
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
    return await this.dbService.setTarget(type, targetValue);
  }

  // 目標値取得
  async getTarget(type: string): Promise<number | null> {
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

      // 体重の場合は目標値に近いほど達成率が高くなるように計算
      if (type === '体重') {
        const allData = await this.getVitalDataByType(type);
        if (allData.length < 2) return 100;

        const initialValue = allData[allData.length - 1].value;
        const initialDiff = Math.abs(initialValue - target);
        if (initialDiff === 0) return 100;

        const currentDiff = Math.abs(latestValue - target);
        return Math.max(0, Math.min(100, (1 - currentDiff / initialDiff) * 100));
      }

      // その他の場合は目標値に対する割合
      return Math.min(100, (latestValue / target) * 100);
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
}
