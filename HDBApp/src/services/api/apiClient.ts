import { mockApi } from './mockApi';

// API設定
const API_CONFIG = {
  USE_MOCK: true, // モックAPIを使用するかどうか
  BASE_URL: 'https://api.hdb.example.com', // 本番APIのベースURL
  TIMEOUT: 30000, // タイムアウト（ミリ秒）
};

// APIクライアントのインターフェース
interface IApiClient {
  // 認証
  login(username: string, password: string): Promise<any>;
  logout(): Promise<any>;
  verifyToken(): Promise<any>;

  // ユーザー
  getProfile(): Promise<any>;
  updateProfile(updates: any): Promise<any>;

  // バイタルデータ
  getVitals(params?: any): Promise<any>;
  createVital(vitalData: any): Promise<any>;
  updateVital(id: string, updates: any): Promise<any>;
  deleteVital(id: string): Promise<any>;
  getVitalSummary(): Promise<any>;

  // ランキング
  getRankings(type?: string): Promise<any>;

  // 通知
  getNotifications(): Promise<any>;
  markNotificationAsRead(id: string): Promise<any>;

  // デバイス
  registerDevice(deviceInfo: any): Promise<any>;
  updateDevice(id: string, updates: any): Promise<any>;
  updatePushToken(deviceId: string, token: string): Promise<any>;

  // データ同期
  createBackup(): Promise<any>;
  restoreBackup(backupId: string): Promise<any>;
  
  // バイタルデータ一括アップロード
  uploadVitalsBatch(vitals: any[]): Promise<any>;

  // データ移行
  migrationAuth(username: string, password: string): Promise<any>;
  executeMigration(migrationToken: string): Promise<any>;
}

// 実際のAPIクライアント（将来実装）
class RealApiClient implements IApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    // AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle timeout error
      if (error.name === 'AbortError') {
        const timeoutError = new Error('API Error: Request timed out.');
        timeoutError.name = 'TimeoutError';
        
        // Retry logic for timeout errors
        if (retryCount < 2) {
          console.warn(`Request timeout, retrying... (attempt ${retryCount + 1}/3)`);
          return this.request(endpoint, options, retryCount + 1);
        }
        
        console.error('API request timeout after retries:', error);
        throw timeoutError;
      }

      // Handle network errors
      if (error.message === 'Failed to fetch' || error.message === 'Network request failed') {
        const networkError = new Error('ネットワークに接続できません');
        networkError.name = 'NetworkError';
        
        // Retry logic for network errors
        if (retryCount < 2) {
          console.warn(`Network error, retrying... (attempt ${retryCount + 1}/3)`);
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.request(endpoint, options, retryCount + 1);
        }
        
        console.error('API network error after retries:', error);
        throw networkError;
      }

      console.error('API request error:', error);
      throw error;
    }
  }

  // 以下、実装は省略（モックと同じインターフェース）
  async login(username: string, password: string): Promise<any> {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (response.data?.token) {
      this.token = response.data.token;
    }
    return response;
  }

  async logout(): Promise<any> {
    const response = await this.request('/api/auth/logout', {
      method: 'POST',
    });
    this.token = null;
    return response;
  }

  async verifyToken(): Promise<any> {
    return this.request('/api/auth/verify');
  }

  async getProfile(): Promise<any> {
    return this.request('/api/users/profile');
  }

  async updateProfile(updates: any): Promise<any> {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getVitals(params?: any): Promise<any> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request(`/api/vitals${queryString}`);
  }

  async createVital(vitalData: any): Promise<any> {
    return this.request('/api/vitals', {
      method: 'POST',
      body: JSON.stringify(vitalData),
    });
  }

  async updateVital(id: string, updates: any): Promise<any> {
    return this.request(`/api/vitals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteVital(id: string): Promise<any> {
    return this.request(`/api/vitals/${id}`, {
      method: 'DELETE',
    });
  }

  async getVitalSummary(): Promise<any> {
    return this.request('/api/vitals/summary');
  }

  async getRankings(type: string = 'steps'): Promise<any> {
    return this.request(`/api/rankings?type=${type}`);
  }

  async getNotifications(): Promise<any> {
    return this.request('/api/notifications');
  }

  async markNotificationAsRead(id: string): Promise<any> {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async registerDevice(deviceInfo: any): Promise<any> {
    return this.request('/api/devices/register', {
      method: 'POST',
      body: JSON.stringify(deviceInfo),
    });
  }

  async updateDevice(id: string, updates: any): Promise<any> {
    return this.request(`/api/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async updatePushToken(deviceId: string, token: string): Promise<any> {
    return this.request(`/api/devices/${deviceId}/token`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async createBackup(): Promise<any> {
    return this.request('/api/sync/backup', {
      method: 'POST',
    });
  }

  async restoreBackup(backupId: string): Promise<any> {
    return this.request('/api/sync/restore', {
      method: 'POST',
      body: JSON.stringify({ backupId }),
    });
  }

  async uploadVitalsBatch(vitals: any[]): Promise<any> {
    return this.request('/api/vitals/batch', {
      method: 'POST',
      body: JSON.stringify({ vitals }),
    });
  }

  async migrationAuth(username: string, password: string): Promise<any> {
    return this.request('/api/migration/auth', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async executeMigration(migrationToken: string): Promise<any> {
    return this.request('/api/migration/execute', {
      method: 'POST',
      body: JSON.stringify({ migrationToken }),
    });
  }
}

// APIクライアントのファクトリー
class ApiClientFactory {
  static create(): IApiClient {
    if (API_CONFIG.USE_MOCK) {
      return mockApi;
    }
    return new RealApiClient(API_CONFIG.BASE_URL);
  }
}

// エクスポート
export const apiClient = ApiClientFactory.create();
export { API_CONFIG };