// バイタルデータ自動同期サービス
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VitalDataService } from './VitalDataService';

export class SyncService {
  private static instance: SyncService;
  private vitalDataService: VitalDataService;
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncTime: Date | null = null;
  private isEnabled: boolean = false;
  
  // 同期間隔（ミリ秒）
  private readonly SYNC_INTERVAL = 60 * 60 * 1000; // 1時間
  private readonly SYNC_STORAGE_KEY = 'last_sync_time';
  private readonly SYNC_ENABLED_KEY = 'auto_sync_enabled';

  private constructor() {
    this.vitalDataService = new VitalDataService();
    this.initializeSync();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private async initializeSync() {
    try {
      // 自動同期設定を読み込む
      const enabled = await AsyncStorage.getItem(this.SYNC_ENABLED_KEY);
      this.isEnabled = enabled === 'true';
      
      // 最終同期時刻を読み込む
      const lastSync = await AsyncStorage.getItem(this.SYNC_STORAGE_KEY);
      if (lastSync) {
        this.lastSyncTime = new Date(lastSync);
      }
      
      if (this.isEnabled) {
        this.startAutoSync();
      }
      
      // アプリの状態変化を監視
      AppState.addEventListener('change', this.handleAppStateChange);
    } catch (error) {
      console.error('Error initializing sync service:', error);
    }
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && this.isEnabled) {
      // アプリがアクティブになったら同期チェック
      this.checkAndSync();
    }
  };

  async setAutoSyncEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    await AsyncStorage.setItem(this.SYNC_ENABLED_KEY, enabled.toString());
    
    if (enabled) {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
  }

  private startAutoSync() {
    console.log('Starting auto sync service...');
    
    // 既存のインターバルをクリア
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // 即座に同期チェック
    this.checkAndSync();
    
    // 定期的な同期を設定
    this.syncInterval = setInterval(() => {
      this.checkAndSync();
    }, this.SYNC_INTERVAL);
  }

  private stopAutoSync() {
    console.log('Stopping auto sync service...');
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async checkAndSync() {
    try {
      const now = new Date();
      
      // 最終同期から1時間経過しているか確認
      if (this.lastSyncTime) {
        const timeSinceLastSync = now.getTime() - this.lastSyncTime.getTime();
        if (timeSinceLastSync < this.SYNC_INTERVAL) {
          console.log('Skipping sync - not enough time elapsed');
          return;
        }
      }
      
      await this.performSync();
    } catch (error) {
      console.error('Error during sync check:', error);
    }
  }

  async performSync() {
    try {
      console.log('Starting data sync to バイタルAWS...');
      
      // VitalDataServiceを初期化
      await this.vitalDataService.initializeService();
      
      // バイタルAWSへアップロード
      await this.vitalDataService.uploadToVitalAWS();
      
      // 最終同期時刻を更新
      this.lastSyncTime = new Date();
      await AsyncStorage.setItem(this.SYNC_STORAGE_KEY, this.lastSyncTime.toISOString());
      
      console.log('Data sync completed successfully');
    } catch (error) {
      console.error('Error during data sync:', error);
      throw error;
    }
  }

  async getLastSyncTime(): Promise<Date | null> {
    return this.lastSyncTime;
  }

  async getSyncStatus(): Promise<{
    enabled: boolean;
    lastSyncTime: Date | null;
    nextSyncTime: Date | null;
  }> {
    let nextSyncTime = null;
    
    if (this.isEnabled && this.lastSyncTime) {
      nextSyncTime = new Date(this.lastSyncTime.getTime() + this.SYNC_INTERVAL);
    }
    
    return {
      enabled: this.isEnabled,
      lastSyncTime: this.lastSyncTime,
      nextSyncTime,
    };
  }

  // 手動同期
  async manualSync(): Promise<void> {
    await this.performSync();
  }

  // クリーンアップ
  cleanup() {
    this.stopAutoSync();
    AppState.removeEventListener('change', this.handleAppStateChange);
  }
}