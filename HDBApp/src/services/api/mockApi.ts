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

    const user = mockUsers[username];
    if (!user || password.length < 4) {
      return {
        success: false,
        error: 'Invalid credentials',
        message: 'ユーザーIDまたはパスワードが正しくありません',
      };
    }

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

    if (!token || !userStr) {
      return {
        success: false,
        error: 'Unauthorized',
        message: '認証が必要です',
      };
    }

    return {
      success: true,
      data: {
        token,
        user: JSON.parse(userStr),
      },
    };
  }

  // ユーザー関連API
  async getProfile(): Promise<ApiResponse<any>> {
    await delay(500);
    const userStr = await AsyncStorage.getItem('current_user');
    
    if (!userStr) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    return {
      success: true,
      data: JSON.parse(userStr),
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