import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { DatabaseService } from './DatabaseService';

interface CacheEntry {
  key: string;
  data: any;
  timestamp: string;
  expiresAt?: string;
  priority: 'high' | 'medium' | 'low';
  size: number;
}

interface CacheConfig {
  maxSizeBytes: number;
  defaultTTL: number; // Time to live in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
}

interface OfflineRequest {
  id: string;
  method: string;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timestamp: string;
  retryCount: number;
  priority: number;
}

export class OfflineCacheService {
  private static instance: OfflineCacheService;
  private dbService: DatabaseService;
  private isOnline: boolean = true;
  private config: CacheConfig = {
    maxSizeBytes: 50 * 1024 * 1024, // 50MB
    defaultTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
    cleanupInterval: 60 * 60 * 1000, // 1 hour
  };
  private cleanupTimer?: NodeJS.Timeout;
  private netInfoUnsubscribe?: () => void;

  private constructor() {
    this.dbService = DatabaseService.getInstance();
    this.initializeCache();
  }

  static getInstance(): OfflineCacheService {
    if (!OfflineCacheService.instance) {
      OfflineCacheService.instance = new OfflineCacheService();
    }
    return OfflineCacheService.instance;
  }

  // キャッシュの初期化
  private async initializeCache(): Promise<void> {
    try {
      // キャッシュテーブルの作成
      await this.createCacheTables();
      
      // ネットワーク状態の監視
      this.netInfoUnsubscribe = NetInfo.addEventListener(this.handleNetworkChange.bind(this));
      
      // 初回のネットワーク状態を取得
      const state = await NetInfo.fetch();
      this.isOnline = state.isConnected || false;
      
      // 定期的なクリーンアップ
      this.startCleanupTimer();
      
      // オフライン時に保存されたリクエストの処理
      if (this.isOnline) {
        await this.processOfflineRequests();
      }
      
      console.log('[OfflineCache] Initialized successfully');
    } catch (error) {
      console.error('[OfflineCache] Initialization failed:', error);
    }
  }

  // キャッシュテーブルの作成
  private async createCacheTables(): Promise<void> {
    // キャッシュエントリテーブル
    const cacheTableSql = `
      CREATE TABLE IF NOT EXISTS cache_entries (
        key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        expires_at TEXT,
        priority TEXT DEFAULT 'medium',
        size INTEGER NOT NULL,
        last_accessed TEXT,
        access_count INTEGER DEFAULT 0
      )
    `;
    
    // オフラインリクエストテーブル
    const offlineRequestsSql = `
      CREATE TABLE IF NOT EXISTS offline_requests (
        id TEXT PRIMARY KEY,
        method TEXT NOT NULL,
        url TEXT NOT NULL,
        data TEXT,
        headers TEXT,
        timestamp TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        priority INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending'
      )
    `;
    
    await this.dbService.executeSql(cacheTableSql);
    await this.dbService.executeSql(offlineRequestsSql);
  }

  // ネットワーク状態の変更処理
  private async handleNetworkChange(state: NetInfoState): Promise<void> {
    const wasOffline = !this.isOnline;
    this.isOnline = state.isConnected || false;
    
    console.log(`[OfflineCache] Network state changed: ${this.isOnline ? 'Online' : 'Offline'}`);
    
    // オフラインからオンラインに復帰した場合
    if (wasOffline && this.isOnline) {
      console.log('[OfflineCache] Back online, processing offline requests...');
      await this.processOfflineRequests();
    }
  }

  // データのキャッシュ
  async cache(key: string, data: any, options?: {
    ttl?: number;
    priority?: CacheEntry['priority'];
  }): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const ttl = options?.ttl || this.config.defaultTTL;
      const expiresAt = new Date(Date.now() + ttl).toISOString();
      const dataStr = JSON.stringify(data);
      const size = new Blob([dataStr]).size;
      
      // サイズチェック
      const currentSize = await this.getCacheSize();
      if (currentSize + size > this.config.maxSizeBytes) {
        await this.evictLRU(size);
      }
      
      const sql = `
        INSERT OR REPLACE INTO cache_entries 
        (key, data, timestamp, expires_at, priority, size, last_accessed, access_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `;
      
      await this.dbService.executeSql(sql, [
        key,
        dataStr,
        timestamp,
        expiresAt,
        options?.priority || 'medium',
        size,
        timestamp,
      ]);
      
      console.log(`[OfflineCache] Cached data for key: ${key}`);
    } catch (error) {
      console.error('[OfflineCache] Error caching data:', error);
      throw error;
    }
  }

  // キャッシュからデータを取得
  async get(key: string): Promise<any | null> {
    try {
      const sql = `
        SELECT * FROM cache_entries 
        WHERE key = ? AND (expires_at IS NULL OR expires_at > datetime('now'))
      `;
      
      const result = await this.dbService.executeSql(sql, [key]);
      
      if (result.rows.length > 0) {
        const entry = result.rows.item(0);
        
        // アクセス情報を更新
        await this.updateAccessInfo(key);
        
        return JSON.parse(entry.data);
      }
      
      return null;
    } catch (error) {
      console.error('[OfflineCache] Error getting cached data:', error);
      return null;
    }
  }

  // アクセス情報の更新
  private async updateAccessInfo(key: string): Promise<void> {
    const sql = `
      UPDATE cache_entries 
      SET last_accessed = datetime('now'), 
          access_count = access_count + 1
      WHERE key = ?
    `;
    
    await this.dbService.executeSql(sql, [key]);
  }

  // キャッシュサイズの取得
  private async getCacheSize(): Promise<number> {
    const sql = 'SELECT SUM(size) as total FROM cache_entries';
    const result = await this.dbService.executeSql(sql);
    return result.rows.item(0).total || 0;
  }

  // LRU方式でキャッシュを削除
  private async evictLRU(requiredSpace: number): Promise<void> {
    let freedSpace = 0;
    
    while (freedSpace < requiredSpace) {
      const sql = `
        SELECT key, size FROM cache_entries 
        WHERE priority = 'low'
        ORDER BY last_accessed ASC, access_count ASC
        LIMIT 10
      `;
      
      const result = await this.dbService.executeSql(sql);
      
      if (result.rows.length === 0) {
        // 低優先度のエントリがない場合は中優先度を削除
        const mediumSql = sql.replace("priority = 'low'", "priority = 'medium'");
        const mediumResult = await this.dbService.executeSql(mediumSql);
        
        if (mediumResult.rows.length === 0) {
          break; // これ以上削除できない
        }
        
        for (let i = 0; i < mediumResult.rows.length; i++) {
          const entry = mediumResult.rows.item(i);
          await this.remove(entry.key);
          freedSpace += entry.size;
          
          if (freedSpace >= requiredSpace) break;
        }
      } else {
        for (let i = 0; i < result.rows.length; i++) {
          const entry = result.rows.item(i);
          await this.remove(entry.key);
          freedSpace += entry.size;
          
          if (freedSpace >= requiredSpace) break;
        }
      }
    }
  }

  // キャッシュエントリの削除
  async remove(key: string): Promise<void> {
    const sql = 'DELETE FROM cache_entries WHERE key = ?';
    await this.dbService.executeSql(sql, [key]);
    console.log(`[OfflineCache] Removed cache entry: ${key}`);
  }

  // キャッシュのクリア
  async clear(): Promise<void> {
    const sql = 'DELETE FROM cache_entries';
    await this.dbService.executeSql(sql);
    console.log('[OfflineCache] Cleared all cache entries');
  }

  // 期限切れエントリのクリーンアップ
  private async cleanupExpiredEntries(): Promise<void> {
    const sql = `
      DELETE FROM cache_entries 
      WHERE expires_at IS NOT NULL AND expires_at < datetime('now')
    `;
    
    const result = await this.dbService.executeSql(sql);
    console.log(`[OfflineCache] Cleaned up ${result.rowsAffected} expired entries`);
  }

  // クリーンアップタイマーの開始
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.config.cleanupInterval);
  }

  // オフラインリクエストの保存
  async saveOfflineRequest(request: {
    method: string;
    url: string;
    data?: any;
    headers?: Record<string, string>;
    priority?: number;
  }): Promise<string> {
    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const sql = `
      INSERT INTO offline_requests 
      (id, method, url, data, headers, timestamp, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.dbService.executeSql(sql, [
      id,
      request.method,
      request.url,
      request.data ? JSON.stringify(request.data) : null,
      request.headers ? JSON.stringify(request.headers) : null,
      timestamp,
      request.priority || 0,
    ]);
    
    console.log(`[OfflineCache] Saved offline request: ${id}`);
    return id;
  }

  // オフラインリクエストの処理
  private async processOfflineRequests(): Promise<void> {
    const sql = `
      SELECT * FROM offline_requests 
      WHERE status = 'pending' 
      ORDER BY priority DESC, timestamp ASC
    `;
    
    const result = await this.dbService.executeSql(sql);
    
    for (let i = 0; i < result.rows.length; i++) {
      const request = result.rows.item(i);
      
      try {
        // リクエストの実行（実際のAPI呼び出しはアプリケーション層で行う）
        await this.executeOfflineRequest(request);
        
        // 成功したら削除
        await this.deleteOfflineRequest(request.id);
      } catch (error) {
        console.error(`[OfflineCache] Failed to process offline request ${request.id}:`, error);
        
        // リトライカウントを増やす
        await this.incrementRetryCount(request.id);
      }
    }
  }

  // オフラインリクエストの実行（実装はアプリケーション層に委譲）
  private async executeOfflineRequest(request: OfflineRequest): Promise<void> {
    // この実装はアプリケーション層で行う
    console.log(`[OfflineCache] Executing offline request: ${request.id}`);
    
    // イベントを発火してアプリケーション層に通知
    const event = new CustomEvent('offlineRequestReady', {
      detail: {
        id: request.id,
        method: request.method,
        url: request.url,
        data: request.data ? JSON.parse(request.data) : undefined,
        headers: request.headers ? JSON.parse(request.headers) : undefined,
      },
    });
    
    window.dispatchEvent(event);
  }

  // オフラインリクエストの削除
  private async deleteOfflineRequest(id: string): Promise<void> {
    const sql = 'DELETE FROM offline_requests WHERE id = ?';
    await this.dbService.executeSql(sql, [id]);
  }

  // リトライカウントの増加
  private async incrementRetryCount(id: string): Promise<void> {
    const sql = `
      UPDATE offline_requests 
      SET retry_count = retry_count + 1
      WHERE id = ?
    `;
    
    await this.dbService.executeSql(sql, [id]);
  }

  // サービスのクリーンアップ
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
    }
  }

  // ネットワーク状態の取得
  isNetworkAvailable(): boolean {
    return this.isOnline;
  }

  // キャッシュ統計の取得
  async getCacheStats(): Promise<{
    totalSize: number;
    entryCount: number;
    oldestEntry: string | null;
    mostAccessed: { key: string; count: number } | null;
  }> {
    const sizeSql = 'SELECT SUM(size) as total, COUNT(*) as count FROM cache_entries';
    const sizeResult = await this.dbService.executeSql(sizeSql);
    
    const oldestSql = 'SELECT key, timestamp FROM cache_entries ORDER BY timestamp ASC LIMIT 1';
    const oldestResult = await this.dbService.executeSql(oldestSql);
    
    const mostAccessedSql = 'SELECT key, access_count FROM cache_entries ORDER BY access_count DESC LIMIT 1';
    const mostAccessedResult = await this.dbService.executeSql(mostAccessedSql);
    
    return {
      totalSize: sizeResult.rows.item(0).total || 0,
      entryCount: sizeResult.rows.item(0).count || 0,
      oldestEntry: oldestResult.rows.length > 0 ? oldestResult.rows.item(0).timestamp : null,
      mostAccessed: mostAccessedResult.rows.length > 0 
        ? { key: mostAccessedResult.rows.item(0).key, count: mostAccessedResult.rows.item(0).access_count }
        : null,
    };
  }
}