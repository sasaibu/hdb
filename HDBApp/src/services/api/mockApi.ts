import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  mockUsers,
  mockVitals,
  mockRankings,
  mockNotifications,
  mockDevices,
  generateVitalSummary,
  filterVitalsByDateRange,
  generateRandomVital,
} from './mockData';

// APIレスポンスの遅延をシミュレート
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// モックトークン管理
const MOCK_TOKEN = 'mock-jwt-token-12345';
const TOKEN_KEY = 'auth_token';

// APIレスポンス型定義
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// モックAPIサービス
export class MockApiService {
  private static instance: MockApiService;
  private vitals: any[] = [...mockVitals];
  private notifications: any[] = [...mockNotifications];
  private devices: any[] = [...mockDevices];

  private constructor() {}

  static getInstance(): MockApiService {
    if (!MockApiService.instance) {
      MockApiService.instance = new MockApiService();
    }
    return MockApiService.instance;
  }

  // 認証関連API
  async login(username: string, password: string): Promise<ApiResponse<any>> {
    await delay(1000);

    console.log('MockAPI login - username:', username);
    console.log('MockAPI login - available users:', Object.keys(mockUsers));

    const user = (mockUsers as any)[username];
    if (!user || password.length < 4) {
      console.log('MockAPI login - Login failed. User exists:', !!user, 'Password length:', password.length);
      return {
        success: false,
        error: 'Invalid credentials',
        message: 'ユーザーIDまたはパスワードが正しくありません',
      };
    }

    console.log('MockAPI login - Saving user:', user);
    await AsyncStorage.setItem(TOKEN_KEY, MOCK_TOKEN);
    await AsyncStorage.setItem('current_user', JSON.stringify(user));

    return {
      success: true,
      data: {
        token: MOCK_TOKEN,
        user,
      },
    };
  }

  async logout(): Promise<ApiResponse<void>> {
    await delay(500);
    await AsyncStorage.multiRemove([TOKEN_KEY, 'current_user']);
    return { success: true };
  }

  async verifyToken(): Promise<ApiResponse<any>> {
    await delay(200);
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const userStr = await AsyncStorage.getItem('current_user');

    console.log('MockAPI verifyToken - token:', token);
    console.log('MockAPI verifyToken - userStr:', userStr);

    if (!token || !userStr) {
      console.log('MockAPI verifyToken - Missing token or user');
      return {
        success: false,
        error: 'Unauthorized',
        message: '認証が必要です',
      };
    }

    const user = JSON.parse(userStr);
    return {
      success: true,
      data: {
        isValid: true,
        token,
        user,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24時間後
      },
    };
  }

  // リフレッシュトークンAPI（新規追加）
  async refreshToken(): Promise<ApiResponse<any>> {
    await delay(500);
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const userStr = await AsyncStorage.getItem('current_user');

    if (!token || !userStr) {
      return {
        success: false,
        error: 'Unauthorized',
        message: 'リフレッシュトークンが無効です',
      };
    }

    const newToken = `mock-jwt-token-${Date.now()}`;
    await AsyncStorage.setItem(TOKEN_KEY, newToken);

    return {
      success: true,
      data: {
        accessToken: newToken,
        refreshToken: `refresh-${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }

  // 初期データ取得API（新規追加）
  async getInitialData(): Promise<ApiResponse<any>> {
    await delay(800);
    
    const userStr = await AsyncStorage.getItem('current_user');
    const isFirstLaunch = !(await AsyncStorage.getItem('app_initialized'));

    const initialData = {
      appSettings: {
        theme: 'light',
        language: 'ja',
        notificationsEnabled: true,
        syncInterval: 3600, // 1時間
      },
      serverConfig: {
        apiVersion: '1.0.0',
        maintenanceMode: false,
        features: {
          healthKitSync: true,
          googleFitSync: true,
          pushNotifications: true,
        },
      },
      isFirstLaunch,
      hasUser: !!userStr,
    };

    // 初回起動フラグを設定
    if (isFirstLaunch) {
      await AsyncStorage.setItem('app_initialized', 'true');
    }

    return {
      success: true,
      data: initialData,
    };
  }

  // デバイス初期化API（拡張）
  async initializeDevice(): Promise<ApiResponse<any>> {
    await delay(1200);

    const deviceInfo = {
      platform: 'ios', // または 'android'
      version: '1.0.0',
      buildNumber: '1',
      deviceModel: 'iPhone 15',
      osVersion: '17.0',
      uniqueId: `device-${Date.now()}`,
    };

    const userStr = await AsyncStorage.getItem('current_user');
    const userId = userStr ? JSON.parse(userStr).id : null;

    const device = {
      id: `device-${Date.now()}`,
      userId,
      ...deviceInfo,
      isActive: true,
      pushToken: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.devices.push(device);

    // デバイス情報をローカルに保存
    await AsyncStorage.setItem('device_info', JSON.stringify(device));

    return {
      success: true,
      data: device,
      message: 'デバイスを初期化しました',
    };
  }

  // ユーザー関連API
  async getProfile(): Promise<ApiResponse<any>> {
    await delay(500);
    const userStr = await AsyncStorage.getItem('current_user');
    
    console.log('MockAPI getProfile - userStr:', userStr);
    
    if (!userStr) {
      console.log('MockAPI getProfile - No user found in AsyncStorage');
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const userData = JSON.parse(userStr);
    console.log('MockAPI getProfile - userData:', userData);

    return {
      success: true,
      data: userData,
    };
  }

  async updateProfile(updates: any): Promise<ApiResponse<any>> {
    await delay(800);
    const userStr = await AsyncStorage.getItem('current_user');
    
    if (!userStr) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const user = JSON.parse(userStr);
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem('current_user', JSON.stringify(updatedUser));

    return {
      success: true,
      data: updatedUser,
    };
  }

  // バイタルデータ関連API
  async getVitals(params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<ApiResponse<any[]>> {
    await delay(700);

    let filteredVitals = [...this.vitals];

    if (params?.type) {
      filteredVitals = filteredVitals.filter(v => v.type === params.type);
    }

    if (params?.startDate && params?.endDate) {
      filteredVitals = filterVitalsByDateRange(
        new Date(params.startDate),
        new Date(params.endDate)
      );
    }

    if (params?.limit) {
      filteredVitals = filteredVitals.slice(0, params.limit);
    }

    return {
      success: true,
      data: filteredVitals.sort((a, b) => 
        new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
      ),
    };
  }

  async createVital(vitalData: any): Promise<ApiResponse<any>> {
    await delay(800);

    const userStr = await AsyncStorage.getItem('current_user');
    if (!userStr) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const user = JSON.parse(userStr);
    const newVital = {
      id: `vital-${Date.now()}`,
      userId: user.id,
      ...vitalData,
      createdAt: new Date().toISOString(),
    };

    this.vitals.push(newVital);

    return {
      success: true,
      data: newVital,
      message: 'バイタルデータを登録しました',
    };
  }

  async updateVital(id: string, updates: any): Promise<ApiResponse<any>> {
    await delay(600);

    const index = this.vitals.findIndex(v => v.id === id);
    if (index === -1) {
      return {
        success: false,
        error: 'Not found',
        message: 'データが見つかりません',
      };
    }

    this.vitals[index] = {
      ...this.vitals[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: this.vitals[index],
    };
  }

  async deleteVital(id: string): Promise<ApiResponse<void>> {
    await delay(500);

    const index = this.vitals.findIndex(v => v.id === id);
    if (index === -1) {
      return {
        success: false,
        error: 'Not found',
      };
    }

    this.vitals.splice(index, 1);

    return {
      success: true,
      message: 'データを削除しました',
    };
  }

  async getVitalSummary(): Promise<ApiResponse<any>> {
    await delay(800);

    const userStr = await AsyncStorage.getItem('current_user');
    if (!userStr) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const user = JSON.parse(userStr);
    const summary = generateVitalSummary(user.id);

    return {
      success: true,
      data: summary,
    };
  }

  // ランキング関連API
  async getRankings(type: string = 'steps'): Promise<ApiResponse<any[]>> {
    await delay(600);

    return {
      success: true,
      data: mockRankings,
    };
  }

  // 通知関連API
  async getNotifications(): Promise<ApiResponse<any[]>> {
    await delay(500);

    return {
      success: true,
      data: this.notifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    };
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    await delay(300);

    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }

    return {
      success: true,
    };
  }

  // デバイス関連API
  async registerDevice(deviceInfo: any): Promise<ApiResponse<any>> {
    await delay(1000);

    const userStr = await AsyncStorage.getItem('current_user');
    if (!userStr) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const user = JSON.parse(userStr);
    const newDevice = {
      id: `device-${Date.now()}`,
      userId: user.id,
      ...deviceInfo,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.devices.push(newDevice);

    return {
      success: true,
      data: newDevice,
    };
  }

  async updateDevice(id: string, updates: any): Promise<ApiResponse<any>> {
    await delay(500);

    const device = this.devices.find(d => d.id === id);
    if (!device) {
      return {
        success: false,
        error: 'Not found',
      };
    }

    Object.assign(device, updates, {
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      data: device,
    };
  }

  async updatePushToken(deviceId: string, token: string): Promise<ApiResponse<void>> {
    await delay(400);

    const device = this.devices.find(d => d.id === deviceId);
    if (device) {
      device.pushToken = token;
      device.updatedAt = new Date().toISOString();
    }

    return {
      success: true,
    };
  }

  // データ同期・バックアップ関連API
  async createBackup(): Promise<ApiResponse<any>> {
    await delay(2000); // バックアップ処理は時間がかかることをシミュレート

    const userStr = await AsyncStorage.getItem('current_user');
    if (!userStr) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const user = JSON.parse(userStr);
    const backupData = {
      backupId: `backup-${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
      vitalsCount: this.vitals.filter(v => v.userId === user.id).length,
      size: Math.floor(Math.random() * 1000000) + 500000, // 0.5MB〜1.5MB
    };

    return {
      success: true,
      data: backupData,
      message: 'バックアップを作成しました',
    };
  }

  async restoreBackup(backupId: string): Promise<ApiResponse<any>> {
    await delay(3000); // リストア処理は時間がかかることをシミュレート

    return {
      success: true,
      data: {
        restoredItems: {
          vitals: Math.floor(Math.random() * 100) + 50,
          settings: 1,
        },
      },
      message: 'データを復元しました',
    };
  }

  // データ移行関連API
  async migrationAuth(username: string, password: string): Promise<ApiResponse<any>> {
    await delay(1500);

    // 仮の移行用認証
    if (username === 'olduser' && password.length >= 4) {
      return {
        success: true,
        data: {
          migrationToken: `migration-token-${Date.now()}`,
          userData: {
            userId: username,
            hasData: true,
            vitalsCount: 150,
            lastUpdated: '2025-01-01T00:00:00Z',
          },
        },
      };
    }

    return {
      success: false,
      error: 'Invalid credentials',
      message: '認証に失敗しました',
    };
  }

  async executeMigration(migrationToken: string): Promise<ApiResponse<any>> {
    await delay(5000); // データ移行は時間がかかることをシミュレート

    return {
      success: true,
      data: {
        migratedItems: {
          vitals: 150,
          settings: 1,
          notifications: 10,
        },
      },
      message: 'データ移行が完了しました',
    };
  }

  // バイタルデータ一括アップロード（バイタルAWSへの登録）
  async uploadVitalsBatch(vitals: any[]): Promise<ApiResponse<any>> {
    await delay(1500); // バッチ処理をシミュレート

    const userStr = await AsyncStorage.getItem('current_user');
    if (!userStr) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const user = JSON.parse(userStr);
    const timestamp = new Date().toISOString();
    
    // アップロードされたデータを処理
    const processedVitals = vitals.map((vital, index) => {
      const newVital = {
        id: `vital-${Date.now()}-${index}`,
        userId: user.id,
        ...vital,
        syncedAt: timestamp,
        syncStatus: 'synced',
      };
      
      // モックデータに追加（実際のAWSでは永続化される）
      this.vitals.push(newVital);
      
      return newVital;
    });

    console.log(`MockAPI: Uploaded ${vitals.length} vital records to バイタルAWS`);

    return {
      success: true,
      data: {
        uploadedCount: vitals.length,
        failedCount: 0,
        syncedAt: timestamp,
        processedIds: processedVitals.map(v => v.id),
      },
      message: `${vitals.length}件のバイタルデータをアップロードしました`,
    };
  }

  // デモデータ生成（開発用）
  async generateDemoData(type: string): Promise<ApiResponse<any>> {
    await delay(300);

    const userStr = await AsyncStorage.getItem('current_user');
    if (!userStr) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const user = JSON.parse(userStr);
    const newVital = generateRandomVital(type, user.id);

    if (newVital) {
      this.vitals.push(newVital);
      return {
        success: true,
        data: newVital,
        message: 'デモデータを生成しました',
      };
    }

    return {
      success: false,
      error: 'Invalid type',
    };
  }
}

// シングルトンインスタンスをエクスポート
export const mockApi = MockApiService.getInstance();
