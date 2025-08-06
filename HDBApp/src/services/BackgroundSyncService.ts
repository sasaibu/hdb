import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import BackgroundFetch from 'react-native-background-fetch';
import { VitalDataService } from './VitalDataService';
import { apiClient } from './api/apiClient';
import { DatabaseService, VitalDataRecord } from './DatabaseService';

interface SyncStatus {
  lastSyncTime: string;
  pendingChanges: number;
  syncInProgress: boolean;
  lastError?: string;
}

interface ConflictResolution {
  strategy: 'local_wins' | 'remote_wins' | 'merge' | 'manual';
  conflictCount: number;
  resolvedConflicts: Array<{
    localData: VitalDataRecord;
    remoteData: any;
    resolution: any;
    timestamp: string;
  }>;
}

export class BackgroundSyncService {
  private static instance: BackgroundSyncService;
  private vitalDataService: VitalDataService;
  private dbService: DatabaseService;
  private syncStatus: SyncStatus = {
    lastSyncTime: '',
    pendingChanges: 0,
    syncInProgress: false,
  };

  private constructor() {
    this.vitalDataService = new VitalDataService();
    this.dbService = DatabaseService.getInstance();
  }

  static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  // バックグラウンド同期の初期化
  async initializeBackgroundSync(): Promise<void> {
    try {
      // バックグラウンドフェッチの設定
      await BackgroundFetch.configure({
        minimumFetchInterval: 15, // 15分ごと
        forceAlarmManager: false,
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      }, async (taskId) => {
        console.log('[BackgroundSync] Task started:', taskId);
        
        // ネットワーク接続を確認
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          console.log('[BackgroundSync] No network connection, skipping sync');
          BackgroundFetch.finish(taskId);
          return;
        }

        // 同期実行
        try {
          await this.performSync();
          BackgroundFetch.finish(taskId);
        } catch (error) {
          console.error('[BackgroundSync] Sync failed:', error);
          BackgroundFetch.finish(taskId);
        }
      }, (taskId) => {
        console.log('[BackgroundSync] Task timeout:', taskId);
        BackgroundFetch.finish(taskId);
      });

      // 初回同期状態を読み込み
      await this.loadSyncStatus();
      
      console.log('[BackgroundSync] Initialized successfully');
    } catch (error) {
      console.error('[BackgroundSync] Initialization failed:', error);
      throw error;
    }
  }

  // 手動同期のトリガー
  async triggerSync(): Promise<void> {
    if (this.syncStatus.syncInProgress) {
      console.log('[BackgroundSync] Sync already in progress');
      return;
    }

    await this.performSync();
  }

  // 同期処理の実行
  private async performSync(): Promise<void> {
    try {
      this.syncStatus.syncInProgress = true;
      await this.saveSyncStatus();

      console.log('[BackgroundSync] Starting sync...');

      // 1. ローカルの未同期データを取得
      const unsyncedData = await this.getUnsyncedData();
      console.log(`[BackgroundSync] Found ${unsyncedData.length} unsynced records`);

      // 2. サーバーからの最新データを取得
      const lastSync = this.syncStatus.lastSyncTime || new Date(0).toISOString();
      const remoteData = await this.fetchRemoteChanges(lastSync);
      console.log(`[BackgroundSync] Fetched ${remoteData.length} remote changes`);

      // 3. 競合を検出して解決
      const conflicts = await this.detectConflicts(unsyncedData, remoteData);
      const resolutions = await this.resolveConflicts(conflicts);
      console.log(`[BackgroundSync] Resolved ${resolutions.conflictCount} conflicts`);

      // 4. ローカルデータをアップロード
      if (unsyncedData.length > 0) {
        await this.uploadLocalChanges(unsyncedData);
      }

      // 5. リモートデータをローカルに適用
      await this.applyRemoteChanges(remoteData, resolutions);

      // 6. 同期状態を更新
      this.syncStatus = {
        lastSyncTime: new Date().toISOString(),
        pendingChanges: 0,
        syncInProgress: false,
        lastError: undefined,
      };
      await this.saveSyncStatus();

      console.log('[BackgroundSync] Sync completed successfully');
    } catch (error: any) {
      console.error('[BackgroundSync] Sync failed:', error);
      this.syncStatus.syncInProgress = false;
      this.syncStatus.lastError = error.message;
      await this.saveSyncStatus();
      throw error;
    }
  }

  // 未同期データの取得
  private async getUnsyncedData(): Promise<VitalDataRecord[]> {
    const sql = `
      SELECT * FROM vital_data 
      WHERE sync_status IS NULL OR sync_status = 'pending' OR sync_status = 'modified'
      ORDER BY recorded_date DESC
    `;
    
    try {
      const result = await this.dbService.executeSql(sql);
      const data: VitalDataRecord[] = [];
      
      for (let i = 0; i < result.rows.length; i++) {
        data.push(result.rows.item(i));
      }
      
      return data;
    } catch (error) {
      console.error('[BackgroundSync] Error getting unsynced data:', error);
      return [];
    }
  }

  // リモートの変更を取得
  private async fetchRemoteChanges(since: string): Promise<any[]> {
    try {
      const response = await apiClient.getVitals({
        since,
        includeDeleted: true,
      });

      if (response.success) {
        return response.data || [];
      }
      
      return [];
    } catch (error) {
      console.error('[BackgroundSync] Error fetching remote changes:', error);
      return [];
    }
  }

  // 競合の検出
  private async detectConflicts(localData: VitalDataRecord[], remoteData: any[]): Promise<any[]> {
    const conflicts = [];
    
    for (const local of localData) {
      const remote = remoteData.find(r => 
        r.type === local.type && 
        r.measuredAt.split('T')[0] === local.recorded_date
      );
      
      if (remote) {
        // 同じ日付・タイプのデータが存在する場合は競合
        if (local.value !== remote.value || local.updated_at !== remote.updatedAt) {
          conflicts.push({
            local,
            remote,
            type: 'value_mismatch',
          });
        }
      }
    }
    
    return conflicts;
  }

  // 競合の解決
  private async resolveConflicts(conflicts: any[]): Promise<ConflictResolution> {
    const resolution: ConflictResolution = {
      strategy: await this.getConflictResolutionStrategy(),
      conflictCount: conflicts.length,
      resolvedConflicts: [],
    };

    for (const conflict of conflicts) {
      let resolved;
      
      switch (resolution.strategy) {
        case 'local_wins':
          resolved = conflict.local;
          break;
          
        case 'remote_wins':
          resolved = conflict.remote;
          break;
          
        case 'merge':
          // より新しいデータを優先
          const localTime = new Date(conflict.local.updated_at || conflict.local.created_at).getTime();
          const remoteTime = new Date(conflict.remote.updatedAt).getTime();
          resolved = localTime > remoteTime ? conflict.local : conflict.remote;
          break;
          
        case 'manual':
          // 手動解決が必要な場合は、一旦ローカルを優先
          resolved = conflict.local;
          await this.saveConflictForManualResolution(conflict);
          break;
      }
      
      resolution.resolvedConflicts.push({
        localData: conflict.local,
        remoteData: conflict.remote,
        resolution: resolved,
        timestamp: new Date().toISOString(),
      });
    }
    
    return resolution;
  }

  // 競合解決戦略の取得
  private async getConflictResolutionStrategy(): Promise<ConflictResolution['strategy']> {
    const strategy = await AsyncStorage.getItem('sync_conflict_strategy');
    return (strategy as ConflictResolution['strategy']) || 'merge';
  }

  // 手動解決が必要な競合を保存
  private async saveConflictForManualResolution(conflict: any): Promise<void> {
    const conflicts = await AsyncStorage.getItem('pending_conflicts');
    const pendingConflicts = conflicts ? JSON.parse(conflicts) : [];
    pendingConflicts.push({
      ...conflict,
      detectedAt: new Date().toISOString(),
    });
    await AsyncStorage.setItem('pending_conflicts', JSON.stringify(pendingConflicts));
  }

  // ローカル変更のアップロード
  private async uploadLocalChanges(data: VitalDataRecord[]): Promise<void> {
    try {
      // バッチアップロード用にデータを変換
      const vitalsToUpload = data.map(record => ({
        type: this.vitalDataService.convertTypeToApiFormat(record.type),
        value: record.value,
        value2: record.diastolic,
        unit: record.unit,
        measuredAt: `${record.recorded_date}T00:00:00Z`,
        source: record.source || 'manual',
        localId: record.id,
        updatedAt: record.updated_at,
      }));

      const response = await apiClient.uploadVitalsBatch(vitalsToUpload);
      
      if (response.success) {
        // 同期済みフラグを更新
        for (const record of data) {
          if (record.id) {
            await this.markAsSynced(record.id);
          }
        }
      }
    } catch (error) {
      console.error('[BackgroundSync] Error uploading local changes:', error);
      throw error;
    }
  }

  // リモート変更の適用
  private async applyRemoteChanges(remoteData: any[], resolutions: ConflictResolution): Promise<void> {
    for (const remote of remoteData) {
      // 競合解決済みのデータはスキップ
      const wasConflict = resolutions.resolvedConflicts.some(r => 
        r.remoteData.id === remote.id
      );
      
      if (wasConflict) {
        continue;
      }

      // ローカルに存在しないデータは追加
      const type = this.convertApiTypeToLocal(remote.type);
      const existingData = await this.dbService.getVitalDataByTypeAndDate(
        type,
        remote.measuredAt.split('T')[0]
      );

      if (existingData.length === 0) {
        await this.vitalDataService.addVitalData(
          type,
          remote.value,
          remote.measuredAt.split('T')[0],
          remote.value2, // systolic for blood pressure
          remote.type === 'bloodPressure' ? remote.value : undefined, // diastolic
          remote.source
        );
      }
    }
  }

  // 同期済みマークを付ける
  private async markAsSynced(id: number): Promise<void> {
    const sql = `
      UPDATE vital_data 
      SET sync_status = 'synced', synced_at = datetime('now')
      WHERE id = ?
    `;
    
    await this.dbService.executeSql(sql, [id]);
  }

  // API形式からローカル形式への変換
  private convertApiTypeToLocal(apiType: string): string {
    const typeMap: Record<string, string> = {
      'steps': '歩数',
      'weight': '体重',
      'temperature': '体温',
      'bloodPressure': '血圧',
      'heartRate': '心拍数',
      'pulse': '脈拍',
    };
    
    return typeMap[apiType] || apiType;
  }

  // 同期状態の保存
  private async saveSyncStatus(): Promise<void> {
    await AsyncStorage.setItem('sync_status', JSON.stringify(this.syncStatus));
  }

  // 同期状態の読み込み
  private async loadSyncStatus(): Promise<void> {
    const status = await AsyncStorage.getItem('sync_status');
    if (status) {
      this.syncStatus = JSON.parse(status);
    }
  }

  // 同期状態の取得
  async getSyncStatus(): Promise<SyncStatus> {
    return this.syncStatus;
  }

  // 手動競合解決の取得
  async getPendingConflicts(): Promise<any[]> {
    const conflicts = await AsyncStorage.getItem('pending_conflicts');
    return conflicts ? JSON.parse(conflicts) : [];
  }

  // 手動競合解決の処理
  async resolveManualConflict(conflictId: string, resolution: 'local' | 'remote'): Promise<void> {
    const conflicts = await this.getPendingConflicts();
    const conflict = conflicts.find((c: any) => 
      `${c.local.id}_${c.remote.id}` === conflictId
    );
    
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    if (resolution === 'remote') {
      // リモートデータで上書き
      await this.applyRemoteChanges([conflict.remote], {
        strategy: 'manual',
        conflictCount: 1,
        resolvedConflicts: [],
      });
    }
    // ローカルの場合は何もしない（既にローカルにある）

    // 解決済みの競合を削除
    const remainingConflicts = conflicts.filter((c: any) => 
      `${c.local.id}_${c.remote.id}` !== conflictId
    );
    await AsyncStorage.setItem('pending_conflicts', JSON.stringify(remainingConflicts));
  }

  // 同期設定の変更
  async setSyncInterval(minutes: number): Promise<void> {
    await BackgroundFetch.configure({
      minimumFetchInterval: minutes,
    }, async () => {}, () => {});
  }

  // 同期の無効化
  async disableSync(): Promise<void> {
    await BackgroundFetch.stop();
  }

  // 同期の有効化
  async enableSync(): Promise<void> {
    await this.initializeBackgroundSync();
  }
}