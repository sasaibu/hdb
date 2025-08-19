// モックヘルスプラットフォームサービス
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface HealthData {
  id: string;
  type: 'steps' | 'weight' | 'temperature' | 'bloodPressure' | 'heartRate';
  value: number;
  value2?: number; // 血圧の下の値
  unit: string;
  measuredAt: string;
  source: 'healthkit' | 'googlefit';
}

export class MockHealthPlatformService {
  private static instance: MockHealthPlatformService;
  private isHealthKitEnabled: boolean = false;
  private isGoogleFitEnabled: boolean = false;

  static getInstance(): MockHealthPlatformService {
    if (!MockHealthPlatformService.instance) {
      MockHealthPlatformService.instance = new MockHealthPlatformService();
    }
    return MockHealthPlatformService.instance;
  }

  async initialize() {
    // 設定を読み込む
    const healthKitEnabled = await AsyncStorage.getItem('healthkit_enabled');
    const googleFitEnabled = await AsyncStorage.getItem('googlefit_enabled');
    
    this.isHealthKitEnabled = healthKitEnabled === 'true';
    this.isGoogleFitEnabled = googleFitEnabled === 'true';
  }

  async setHealthKitEnabled(enabled: boolean) {
    this.isHealthKitEnabled = enabled;
    await AsyncStorage.setItem('healthkit_enabled', enabled.toString());
  }

  async setGoogleFitEnabled(enabled: boolean) {
    this.isGoogleFitEnabled = enabled;
    await AsyncStorage.setItem('googlefit_enabled', enabled.toString());
  }

  isHealthKitAvailable(): boolean {
    return Platform.OS === 'ios';
  }

  isGoogleFitAvailable(): boolean {
    return Platform.OS === 'android';
  }

  async requestHealthKitPermission(): Promise<boolean> {
    // モック：2秒待って成功を返す
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Mock: HealthKit permission granted');
    return true;
  }

  async requestGoogleFitPermission(): Promise<boolean> {
    // モック：2秒待って成功を返す
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Mock: Google Fit permission granted');
    return true;
  }

  private generateMockHealthData(days: number): HealthData[] {
    const data: HealthData[] = [];
    const now = new Date();
    const source = Platform.OS === 'ios' ? 'healthkit' : 'googlefit';

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // 歩数データ（日々のランダムな歩数）
      if (this.isHealthKitEnabled || this.isGoogleFitEnabled) {
        data.push({
          id: `health-steps-${i}`,
          type: 'steps',
          value: Math.floor(Math.random() * 5000) + 5000, // 5000-10000歩
          unit: '歩',
          measuredAt: this.setTimeToMorning(date).toISOString(),
          source,
        });
      }

      // 体重データ（週2-3回）
      if ((i % 3 === 0 || i % 4 === 0) && (this.isHealthKitEnabled || this.isGoogleFitEnabled)) {
        data.push({
          id: `health-weight-${i}`,
          type: 'weight',
          value: 65 + Math.random() * 2 - 1, // 64-66kg
          unit: 'kg',
          measuredAt: this.setTimeToMorning(date).toISOString(),
          source,
        });
      }

      // 体温データ（毎日朝）
      if (this.isHealthKitEnabled || this.isGoogleFitEnabled) {
        data.push({
          id: `health-temp-${i}`,
          type: 'temperature',
          value: 36.2 + Math.random() * 0.6, // 36.2-36.8℃
          unit: '℃',
          measuredAt: this.setTimeToMorning(date).toISOString(),
          source,
        });
      }

      // 血圧データ（週3-4回）
      if ((i % 2 === 0 || i % 3 === 0) && (this.isHealthKitEnabled || this.isGoogleFitEnabled)) {
        const systolic = Math.floor(Math.random() * 20) + 110; // 110-130
        const diastolic = Math.floor(Math.random() * 15) + 65; // 65-80
        data.push({
          id: `health-bp-${i}`,
          type: 'bloodPressure',
          value: systolic,
          value2: diastolic,
          unit: 'mmHg',
          measuredAt: this.setTimeToMorning(date).toISOString(),
          source,
        });
      }

      // 心拍数データ（1日3-5回）
      const heartRateTimes = Math.floor(Math.random() * 3) + 3;
      for (let j = 0; j < heartRateTimes; j++) {
        if (this.isHealthKitEnabled || this.isGoogleFitEnabled) {
          const hrDate = new Date(date);
          hrDate.setHours(8 + j * 4); // 8時、12時、16時、20時、24時
          data.push({
            id: `health-hr-${i}-${j}`,
            type: 'heartRate',
            value: Math.floor(Math.random() * 20) + 60, // 60-80 bpm
            unit: 'bpm',
            measuredAt: hrDate.toISOString(),
            source,
          });
        }
      }
    }

    return data;
  }

  private setTimeToMorning(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(7, 0, 0, 0);
    return newDate;
  }

  async fetchRecentHealthData(days: number = 7): Promise<HealthData[]> {
    // 連携が無効な場合は空配列を返す
    if (!this.isHealthKitEnabled && !this.isGoogleFitEnabled) {
      return [];
    }

    // 1秒待機してリアルな通信を模倣
    await new Promise(resolve => setTimeout(resolve, 1000));

    // モックデータを生成
    const mockData = this.generateMockHealthData(days);
    
    console.log(`Mock: Fetched ${mockData.length} health data items from ${Platform.OS === 'ios' ? 'HealthKit' : 'Google Fit'}`);
    
    return mockData;
  }

  async fetchHealthDataByType(type: string, days: number = 30): Promise<HealthData[]> {
    const allData = await this.fetchRecentHealthData(days);
    return allData.filter(item => item.type === type);
  }

  async syncHealthData(): Promise<void> {
    console.log(`Mock: Starting health data sync for ${Platform.OS}`);
    
    // 2秒待機して同期を模倣
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Mock: Health data sync completed');
  }
}