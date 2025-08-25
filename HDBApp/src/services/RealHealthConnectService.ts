import {
  initialize,
  requestPermission,
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

// 実際のHealth Connectデータ取得サービス
class RealHealthConnectService {
  private static instance: RealHealthConnectService;

  public static getInstance(): RealHealthConnectService {
    if (!RealHealthConnectService.instance) {
      RealHealthConnectService.instance = new RealHealthConnectService();
    }
    return RealHealthConnectService.instance;
  }

  // Health Connect利用可能かチェック
  public async isHealthConnectAvailable(): Promise<boolean> {
    try {
      console.log('Checking Health Connect availability...');
      const status = await getSdkStatus();
      console.log('Health Connect SDK Status:', status);
      
      if (status === SdkAvailabilityStatus.SDK_AVAILABLE) {
        await initialize();
        console.log('Health Connect initialized successfully');
        return true;
      }
      
      console.log('Health Connect not available, status:', status);
      return false;
    } catch (error) {
      console.error('Error checking Health Connect availability:', error);
      return false;
    }
  }

  // 権限リクエスト
  public async requestPermissions(): Promise<boolean> {
    try {
      console.log('Requesting Health Connect permissions...');
      
      // まず現在の権限状態を確認
      const permissions = [
        {
          accessType: 'read' as const,
          recordType: 'Steps' as const,
        }
      ];
      
      console.log('Checking current permission status...');
      
      // 権限チェック: データ読み取りを試みる
      try {
        const testRead = await readRecords('Steps', {
          timeRangeFilter: {
            operator: 'between' as const,
            startTime: new Date(Date.now() - 1000).toISOString(), // 1秒前から
            endTime: new Date().toISOString(),
          }
        });
        console.log('Permission already granted, skipping request');
        return true; // 既に権限がある
      } catch (readError) {
        // 権限がない場合のみリクエスト
        console.log('Permission not granted, requesting...');
        
        try {
          const grantedPermissions = await requestPermission(permissions);
          console.log('Permission request completed:', grantedPermissions);
          return grantedPermissions && grantedPermissions.length > 0;
        } catch (requestError) {
          console.error('Permission request failed:', requestError);
          return false;
        }
      }
    } catch (error) {
      console.error('Error in permission handling:', error);
      console.error('Error details:', JSON.stringify(error));
      return false;
    }
  }

  // 実際のデータ取得
  public async getRealHealthData(dataType: string): Promise<any[]> {
    try {
      console.log(`Getting ${dataType} data from Health Connect...`);
      
      const recordType = this.getRecordType(dataType);
      if (!recordType) {
        console.warn(`Unsupported data type: ${dataType}`);
        return [];
      }
      
      // 過去30日間のデータを取得
      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date().toISOString(),
      };
      
      const result = await readRecords(recordType, {
        timeRangeFilter,
      });
      
      console.log(`Retrieved ${result.records.length} ${dataType} records from Health Connect`);
      
      // データを標準化
      return result.records.map((record: any) => ({
        timestamp: new Date(record.time || record.startTime).getTime(),
        value: this.extractValue(record, dataType),
        unit: this.getUnit(dataType),
        source: 'Health Connect',
        dataType,
        rawRecord: record
      }));
      
    } catch (error) {
      console.error(`Error getting ${dataType} data from Health Connect:`, error);
      throw error;
    }
  }
  
  private getRecordType(dataType: string): string | null {
    const typeMap: {[key: string]: string} = {
      'Steps': 'Steps',
      'HeartRate': 'HeartRate', 
      'BloodPressure': 'BloodPressure',
      'Weight': 'Weight',
      'Sleep': 'SleepSession',
      'BodyTemperature': 'BodyTemperature'
    };
    return typeMap[dataType] || null;
  }
  
  private extractValue(record: any, dataType: string): number {
    switch (dataType) {
      case 'Steps':
        return record.count || 0;
      case 'HeartRate':
        return record.beatsPerMinute || 0;
      case 'BloodPressure':
        return record.systolic || 0;
      case 'Weight':
        return record.weight?.inKilograms || 0;
      case 'Sleep':
        return record.duration || 0;
      case 'BodyTemperature':
        return record.temperature?.inCelsius || 0;
      default:
        return 0;
    }
  }

  private getMockValue(dataType: string): number {
    switch (dataType) {
      case 'Steps': return Math.floor(Math.random() * 5000) + 5000;
      case 'HeartRate': return Math.floor(Math.random() * 40) + 60;
      case 'BloodPressure': return Math.floor(Math.random() * 20) + 120;
      case 'Weight': return Math.floor(Math.random() * 20) + 60;
      case 'Sleep': return Math.floor(Math.random() * 120) + 360;
      default: return Math.floor(Math.random() * 100);
    }
  }

  private getUnit(dataType: string): string {
    switch (dataType) {
      case 'Steps': return 'steps';
      case 'HeartRate': return 'bpm';
      case 'BloodPressure': return 'mmHg';
      case 'Weight': return 'kg';
      case 'Sleep': return 'minutes';
      default: return 'unit';
    }
  }
}

export default RealHealthConnectService;