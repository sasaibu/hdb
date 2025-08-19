import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';

/**
 * テスト用のユーティリティ関数とヘルパー
 */

// React Nativeコンポーネントのモックファクトリー
export const createMockComponent = (name: string) => {
  return React.forwardRef((props: any, ref: any) => {
    return React.createElement('View', {
      ...props,
      ref,
      testID: props.testID || name,
      'data-component': name,
    }, props.children);
  });
};

// ナビゲーションのモックファクトリー
export const createMockNavigation = () => ({
  navigate: jest.fn(),
  replace: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getParent: jest.fn(),
  getState: jest.fn(),
  setOptions: jest.fn(),
  setParams: jest.fn(),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeListener: jest.fn(),
});

// 非同期処理のヘルパー
export const waitForAsync = (ms: number = 0) => 
  new Promise(resolve => setTimeout(resolve, ms));

// テストデータファクトリー
export const createTestUser = (overrides = {}) => ({
  id: 'test-user-001',
  username: 'testuser',
  displayName: 'テストユーザー',
  email: 'test@example.com',
  ...overrides,
});

export const createTestVitalData = (type: string, overrides = {}) => {
  const baseData = {
    id: Math.floor(Math.random() * 10000),
    type,
    recorded_date: new Date().toISOString().split('T')[0],
    source: 'manual',
    sync_status: 'pending',
  };

  const typeSpecificData = {
    歩数: { value: 8000, unit: '歩' },
    体重: { value: 65.5, unit: 'kg' },
    体温: { value: 36.5, unit: '℃' },
    血圧: { value: 120, unit: 'mmHg', systolic: 120, diastolic: 80 },
    心拍数: { value: 72, unit: 'bpm' },
    脈拍: { value: 68, unit: 'bpm' },
  };

  return {
    ...baseData,
    ...(typeSpecificData[type] || { value: 0, unit: '' }),
    ...overrides,
  };
};

// AsyncStorageのモックファクトリー
export const createMockAsyncStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => Promise.resolve(store[key] || null)),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
    multiGet: jest.fn((keys: string[]) => 
      Promise.resolve(keys.map(key => [key, store[key] || null]))
    ),
    multiSet: jest.fn((keyValuePairs: [string, string][]) => {
      keyValuePairs.forEach(([key, value]) => {
        store[key] = value;
      });
      return Promise.resolve();
    }),
    multiRemove: jest.fn((keys: string[]) => {
      keys.forEach(key => delete store[key]);
      return Promise.resolve();
    }),
    mergeItem: jest.fn((key: string, value: string) => {
      const existing = store[key];
      if (existing) {
        try {
          const existingObj = JSON.parse(existing);
          const newObj = JSON.parse(value);
          store[key] = JSON.stringify({ ...existingObj, ...newObj });
        } catch {
          store[key] = value;
        }
      } else {
        store[key] = value;
      }
      return Promise.resolve();
    }),
    // テスト用のヘルパーメソッド
    _getStore: () => ({ ...store }),
    _setStore: (newStore: Record<string, string>) => {
      Object.keys(store).forEach(key => delete store[key]);
      Object.assign(store, newStore);
    },
  };
};

// APIレスポンスのモックファクトリー
export const createMockApiResponse = <T>(data: T, options = {}) => ({
  success: true,
  data,
  error: null,
  statusCode: 200,
  ...options,
});

export const createMockApiError = (message: string, statusCode = 500) => ({
  success: false,
  data: null,
  error: message,
  statusCode,
});

// Promise の状態を追跡するヘルパー
export class PromiseTracker<T> {
  promise: Promise<T>;
  isResolved = false;
  isRejected = false;
  result?: T;
  error?: any;

  constructor(promise: Promise<T>) {
    this.promise = promise;
    promise
      .then(result => {
        this.isResolved = true;
        this.result = result;
      })
      .catch(error => {
        this.isRejected = true;
        this.error = error;
      });
  }

  async waitForSettlement() {
    try {
      await this.promise;
    } catch {
      // エラーは内部で処理済み
    }
  }
}

// テスト環境のセットアップヘルパー
export const setupTestEnvironment = () => {
  // タイマーのモック
  jest.useFakeTimers();
  
  // コンソールのモック
  const originalConsole = { ...console };
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
  
  return {
    cleanup: () => {
      jest.useRealTimers();
      Object.assign(console, originalConsole);
      jest.clearAllMocks();
    },
  };
};

// React Native Platform のモックヘルパー
export const mockPlatform = (os: 'ios' | 'android', version?: number) => {
  const Platform = require('react-native').Platform;
  Platform.OS = os;
  if (version !== undefined) {
    Platform.Version = version;
  }
  Platform.select = jest.fn((obj) => obj[os] || obj.default);
};

// 権限のモックヘルパー
export const mockPermissions = (results: Record<string, boolean>) => {
  const PermissionsAndroid = require('react-native').PermissionsAndroid;
  
  PermissionsAndroid.check = jest.fn((permission: string) => 
    Promise.resolve(results[permission] || false)
  );
  
  PermissionsAndroid.request = jest.fn((permission: string) => 
    Promise.resolve(results[permission] ? 'granted' : 'denied')
  );
  
  PermissionsAndroid.requestMultiple = jest.fn((permissions: string[]) => {
    const response: Record<string, string> = {};
    permissions.forEach(p => {
      response[p] = results[p] ? 'granted' : 'denied';
    });
    return Promise.resolve(response);
  });
};

// ディープクローンヘルパー
export const deepClone = <T>(obj: T): T => 
  JSON.parse(JSON.stringify(obj));

// テストのリトライヘルパー
export const retryTest = async (
  fn: () => Promise<void>,
  maxRetries = 3,
  delay = 100
): Promise<void> => {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await fn();
      return;
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await waitForAsync(delay);
      }
    }
  }
  
  throw lastError;
};

// スナップショットテストのヘルパー
export const createSnapshotSerializer = () => ({
  test: (val: any) => val && val._isReactElement,
  print: (val: any) => {
    // React要素を簡潔な形式に変換
    const { type, props } = val;
    const propsString = Object.entries(props)
      .filter(([key]) => key !== 'children')
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    return `<${type} ${propsString} />`;
  },
});

// メモリ使用量の測定ヘルパー
export const measureMemoryUsage = () => {
  if (global.gc) {
    global.gc();
  }
  const usage = process.memoryUsage();
  return {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100, // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100, // MB
    external: Math.round(usage.external / 1024 / 1024 * 100) / 100, // MB
    rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100, // MB
  };
};

// パフォーマンス測定ヘルパー
export const measurePerformance = async (
  name: string,
  fn: () => Promise<void>
): Promise<number> => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  const duration = end - start;
  console.info(`${name} took ${duration.toFixed(2)}ms`);
  return duration;
};

// テストのグループ化ヘルパー
export const describeIf = (condition: boolean, name: string, fn: () => void) => {
  if (condition) {
    describe(name, fn);
  } else {
    describe.skip(name, fn);
  }
};

export const itIf = (condition: boolean, name: string, fn: () => void) => {
  if (condition) {
    it(name, fn);
  } else {
    it.skip(name, fn);
  }
};