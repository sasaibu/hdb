import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// デバイス情報収集サービス（新ER図対応）
export class DeviceInfoService {
  private static instance: DeviceInfoService;

  private constructor() {}

  static getInstance(): DeviceInfoService {
    if (!DeviceInfoService.instance) {
      DeviceInfoService.instance = new DeviceInfoService();
    }
    return DeviceInfoService.instance;
  }

  /**
   * 新ER図device_infoテーブル対応のデバイス情報を収集
   */
  async collectDeviceInfo(): Promise<any> {
    try {
      // 基本デバイス情報収集
      const deviceInfo = {
        // デバイスID（ユーザー単位ではない）- 新ER図対応
        deviceId: await this.generateDeviceId(),
        
        // アプリ側で取得してAPIに送信 - 新ER図対応
        os: Platform.OS, // 'ios' または 'android'
        version: await this.getOSVersion(),
        
        // デバイストークン（Push通知用）
        deviceToken: await this.getDeviceToken(),
        
        // 追加デバイス情報
        deviceModel: await this.getDeviceModel(),
        buildNumber: await this.getBuildNumber(),
        uniqueId: await this.getUniqueId(),
        
        // おすすめ目標配列（新仕様対応）
        recommendedGoals: await this.getRecommendedGoals(),
        
        // 移行データ配列（新仕様対応）
        migrationData: await this.getMigrationData(),
        
        // 利用権限配列（新仕様対応）
        permissions: await this.getPermissions(),
        
        // 1日1回実行制御情報
        dailyExecutionInfo: await this.getDailyExecutionInfo(),
      };

      console.log('DeviceInfoService: Collected device info for new ER structure:', {
        deviceId: deviceInfo.deviceId,
        os: deviceInfo.os,
        version: deviceInfo.version,
        hasToken: !!deviceInfo.deviceToken,
        recommendedGoalsCount: deviceInfo.recommendedGoals.length,
        permissionsCount: deviceInfo.permissions.length,
      });

      return deviceInfo;
    } catch (error) {
      console.error('DeviceInfoService: Failed to collect device info:', error);
      throw error;
    }
  }

  /**
   * デバイスID生成（ユーザー単位ではない）
   */
  private async generateDeviceId(): Promise<string> {
    const existingId = await AsyncStorage.getItem('device_id');
    if (existingId) {
      return existingId;
    }

    // デバイス固有IDを生成（ユーザーに依存しない）
    const deviceId = `device-${Platform.OS}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem('device_id', deviceId);
    
    return deviceId;
  }

  /**
   * OSバージョン取得
   */
  private async getOSVersion(): Promise<string> {
    try {
      if (Platform.OS === 'ios') {
        // iOS の場合、実際のプロジェクトでは react-native-device-info を使用
        return Platform.Version.toString();
      } else {
        // Android の場合
        return Platform.Version.toString();
      }
    } catch (error) {
      console.warn('Failed to get OS version:', error);
      return 'unknown';
    }
  }

  /**
   * デバイストークン取得（Push通知用）
   */
  private async getDeviceToken(): Promise<string | null> {
    try {
      // 実際のプロジェクトでは Firebase Messaging からトークンを取得
      const existingToken = await AsyncStorage.getItem('device_token');
      if (existingToken) {
        // デバイストークン最終使用日時を更新（270日期限管理用）
        await this.updateTokenLastUsedDate();
        return existingToken;
      }

      // 新規トークン生成（モック）
      const newToken = `mock-token-${Platform.OS}-${Date.now()}`;
      await AsyncStorage.setItem('device_token', newToken);
      await this.updateTokenLastUsedDate();
      
      return newToken;
    } catch (error) {
      console.warn('Failed to get device token:', error);
      return null;
    }
  }

  /**
   * デバイストークン最終使用日時更新（270日期限管理用）
   */
  private async updateTokenLastUsedDate(): Promise<void> {
    const now = new Date().toISOString();
    await AsyncStorage.setItem('device_token_last_used', now);
  }

  /**
   * デバイスモデル取得
   */
  private async getDeviceModel(): Promise<string> {
    try {
      // 実際のプロジェクトでは react-native-device-info を使用
      if (Platform.OS === 'ios') {
        return 'iPhone'; // 実際は具体的なモデル名
      } else {
        return 'Android Device'; // 実際は具体的なモデル名
      }
    } catch (error) {
      console.warn('Failed to get device model:', error);
      return 'Unknown Device';
    }
  }

  /**
   * ビルド番号取得
   */
  private async getBuildNumber(): Promise<string> {
    try {
      // 実際のプロジェクトでは react-native-device-info を使用
      return '1'; // アプリのビルド番号
    } catch (error) {
      console.warn('Failed to get build number:', error);
      return '1';
    }
  }

  /**
   * ユニークID取得
   */
  private async getUniqueId(): Promise<string> {
    try {
      const existingId = await AsyncStorage.getItem('unique_id');
      if (existingId) {
        return existingId;
      }

      const uniqueId = `unique-${Platform.OS}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('unique_id', uniqueId);
      
      return uniqueId;
    } catch (error) {
      console.warn('Failed to get unique ID:', error);
      return `fallback-${Date.now()}`;
    }
  }

  /**
   * おすすめ目標配列取得（新仕様対応）
   */
  private async getRecommendedGoals(): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem('recommended_goals');
      if (stored) {
        return JSON.parse(stored);
      }

      // デフォルトのおすすめ目標
      const defaultGoals = [
        { goalId: 'GOAL_001', goalName: '1日8000歩', category: 'steps', priority: 1, enabled: true },
        { goalId: 'GOAL_002', goalName: '週3回運動', category: 'exercise', priority: 2, enabled: true },
        { goalId: 'GOAL_003', goalName: '体重維持', category: 'weight', priority: 3, enabled: false },
        { goalId: 'GOAL_004', goalName: '血圧管理', category: 'bloodPressure', priority: 4, enabled: false },
        { goalId: 'GOAL_005', goalName: '心拍数管理', category: 'heartRate', priority: 5, enabled: false },
      ];

      await AsyncStorage.setItem('recommended_goals', JSON.stringify(defaultGoals));
      return defaultGoals;
    } catch (error) {
      console.warn('Failed to get recommended goals:', error);
      return [];
    }
  }

  /**
   * 移行データ配列取得（新仕様対応）
   */
  private async getMigrationData(): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem('migration_data');
      if (stored) {
        return JSON.parse(stored);
      }

      // 移行データがない場合は空配列
      return [];
    } catch (error) {
      console.warn('Failed to get migration data:', error);
      return [];
    }
  }

  /**
   * 利用権限配列取得（新仕様対応）
   */
  private async getPermissions(): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem('app_permissions');
      if (stored) {
        return JSON.parse(stored);
      }

      // デフォルト権限状態
      const defaultPermissions = [
        { type: 'healthkit', granted: false, requestedAt: null, description: 'HealthKitデータアクセス' },
        { type: 'healthconnect', granted: false, requestedAt: null, description: 'Health Connectデータアクセス' },
        { type: 'notifications', granted: false, requestedAt: null, description: 'プッシュ通知' },
        { type: 'location', granted: false, requestedAt: null, description: '位置情報' },
        { type: 'camera', granted: false, requestedAt: null, description: 'カメラ' },
      ];

      await AsyncStorage.setItem('app_permissions', JSON.stringify(defaultPermissions));
      return defaultPermissions;
    } catch (error) {
      console.warn('Failed to get permissions:', error);
      return [];
    }
  }

  /**
   * 1日1回実行制御情報取得
   */
  private async getDailyExecutionInfo(): Promise<any> {
    try {
      const stored = await AsyncStorage.getItem('daily_execution_control');
      if (stored) {
        return JSON.parse(stored);
      }

      const defaultControl = {
        lastExecutedDate: null, // YYYY-MM-DD形式
        executionCount: 0,
        maxExecutionsPerDay: 1,
        resetTime: '00:00', // リセット時刻
      };

      await AsyncStorage.setItem('daily_execution_control', JSON.stringify(defaultControl));
      return defaultControl;
    } catch (error) {
      console.warn('Failed to get daily execution info:', error);
      return {
        lastExecutedDate: null,
        executionCount: 0,
        maxExecutionsPerDay: 1,
        resetTime: '00:00',
      };
    }
  }

  /**
   * 1日1回実行制御チェック
   */
  async canExecuteToday(): Promise<boolean> {
    try {
      const control = await this.getDailyExecutionInfo();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      if (control.lastExecutedDate !== today) {
        // 日付が変わった場合はリセット
        control.lastExecutedDate = today;
        control.executionCount = 0;
        await AsyncStorage.setItem('daily_execution_control', JSON.stringify(control));
        return true;
      }

      return control.executionCount < control.maxExecutionsPerDay;
    } catch (error) {
      console.warn('Failed to check daily execution:', error);
      return true; // エラー時は実行を許可
    }
  }

  /**
   * 1日1回実行制御カウンター更新
   */
  async incrementExecutionCount(): Promise<void> {
    try {
      const control = await this.getDailyExecutionInfo();
      const today = new Date().toISOString().split('T')[0];

      if (control.lastExecutedDate === today) {
        control.executionCount += 1;
      } else {
        control.lastExecutedDate = today;
        control.executionCount = 1;
      }

      await AsyncStorage.setItem('daily_execution_control', JSON.stringify(control));
    } catch (error) {
      console.warn('Failed to increment execution count:', error);
    }
  }

  /**
   * デバイストークン期限チェック（270日）
   */
  async isTokenExpired(): Promise<boolean> {
    try {
      const lastUsedStr = await AsyncStorage.getItem('device_token_last_used');
      if (!lastUsedStr) {
        return true; // 使用履歴がない場合は期限切れとみなす
      }

      const lastUsed = new Date(lastUsedStr);
      const daysSinceLastUse = Math.floor((Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysSinceLastUse >= 270; // 270日以上未使用で期限切れ
    } catch (error) {
      console.warn('Failed to check token expiration:', error);
      return false;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const deviceInfoService = DeviceInfoService.getInstance();
